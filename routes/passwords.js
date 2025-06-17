const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../crypto_utils');
const db = require('../db');

router.get('/get-passwords', verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query('SELECT * FROM passwords WHERE user_id = ?', [userId], (err, results) => {
	if (err) {
	    return res.status(500).json({ error: 'Erreur lors de la récupération des mots de passe', details: err });
	}

	if (results.length === 0) {
	    return res.status(200).json([]);
	}

	const decryptedResults = results.map(p => {
  	    const { password_encrypted, ...rest } = p;
  	    return {
    		...rest,
    		password: decrypt(password_encrypted)
	    };
	});

	res.status(200).json(decryptedResults);
    });

});

router.post('/add-password', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { service, url, email, username, password, note } = req.body;

    if (!service || !password) {
	return res.status(400).json({ error: 'Le service et le mot de passe sont obligatoire' });
    }

    try {
	const query = `
	    INSERT  INTO passwords (user_id, service, url, email, username, password_encrypted, note)
	    VALUES (?, ?, ?, ?, ?, ?, ?)
	`;

	const encryptedPassword = encrypt(password);

	db.query(query, [userId, service, url || null, email || null,  username || null, encryptedPassword, note || null], (err, result) => {
	    if (err) {
		return res.status(500).json({ error: 'Erreur lors de l\'enregistrement', details: err });
	    }

	    res.status(201).json({ message: 'Mot de passe enregistré', passwordId: result.insertId });
	});
    } catch (e) {
	res.status(500).json({ error: 'Erreur interne', details: e });
    }
});

router.delete('/delete-password/:id', verifyToken, (req, res) => {
    const userId = req.user.id;
    const passwordId = req.params.id;

    if (!passwordId) {
	return res.status(400).json({ error: 'Vous devez préciser l\'ID du mot de passe' });
    }

    const query = `
	DELETE FROM passwords WHERE id = ? AND user_id = ?
    `;

    db.query(query, [passwordId, userId], (err, result) => {
	if (err) {
	    return res.status(500).json({ error: 'Erreur lors de la suppression', details: err });
	}

	if (result.affectedRows === 0) {
	    return res.status(404).json({ error: 'Mot de passe introuvable' });
	}

	res.status(200).json({ message: 'Mot de passe supprimé' });
    });

});

router.put('/update-password/:id', verifyToken, (req, res) => {
	const userId = req.user.id;
	const passwordId = req.params.id;
	const { service, url, email, username, password, note } = req.body;

	if (!passwordId) {
		return res.status(400).json({ error: 'Vous devez préciser l\'ID du mot de passe' });
	}

	try {
		const checkQuery = 'SELECT id FROM passwords WHERE id = ? AND user_id = ?';
		db.query(checkQuery, [passwordId, userId], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Erreur lors de la vérification', details: err });
			}
			if (result.length === 0) {
				return res.status(404).json({ error: 'Mot de passe introuvable' });
			}

			const encryptedPassword = password ? encrypt(password) : null;

			const updateQuery = `
			UPDATE passwords
			SET service = ?,
			    url = ?,
				email = ?,
				username = ?,
				password = ?,
				note = ?
			WHERE id = ? AND user_id = ?
			`;

			db.query(updateQuery, [
				service || null,
				url || null,
				email || null,
				username || null,
				encryptedPassword || null,
				note || null,
				passwordId, userId
			], (updateErr, result) => {
				if (updateErr) {
					return res.status(500).json({ error: 'Erreur lors de la mise à jour', details: updateErr });
				}

				res.status(200).json({ message: 'Mot de passe mis à jour' });
			});
		})
	} catch (e) {
		res.status(500).json({ error: 'Erreur interne', details: e });
	}
});

module.exports = router;