const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const bcrypt = require('bcrypt');
const db = require('../db');

router.get('/get-passwords', verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query('SELECT * FROM passwords WHERE user_id = ?', [userId], (err, results) => {
	if (err) {
	    return res.status(500).json({ error: 'Erreur lors de la récupération des mots de passe', details: err });
	}

	if (results.length === 0) {
	    return res.status(404).json({ error: 'Aucun mot de passe trouvé' });
	}

	res.status(201).json({ message: 'Mots de passe récupérés', passwords: results });
    });

});


router.post('/add-password', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { title, login, password, note } = req.body;

    if (!title || !password) {
	return res.status(400).json({ error: 'Le titre et le mot de passe sont obligatoire' });
    }

    try {
	const query = `
	    INSERT  INTO passwords (user_id, title, login, password, password_hash, note)
	    VALUES (?, ?, ?, ?, ?, ?)
	`;

	const hash = await bcrypt.hash(password, 10);

	db.query(query, [userId, title, login || null, password, hash, note || null], (err, result) => {
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

module.exports = router;
