const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authController = require('../controllers/authController');
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/update-master-password', verifyToken, (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Les champs oldPassword et newPassword sont obligatoires' });
    }

    try {
        const checkQuery = `SELECT password_hash FROM users WHERE id = ?`;
        
        db.query(checkQuery, [userId], async (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la vérification de l\'utilisateur', details: err });
            }

            const isMatch = await bcrypt.compare(oldPassword, result[0].password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Mot de passe incorrect' });
            }

            const hash = await bcrypt.hash(newPassword, 10);
            const updateQuery = `UPDATE users SET password_hash = ?, password = ? WHERE id = ?`;
            db.query(updateQuery, [hash, newPassword, userId], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe', details: err });
                }

                res.status(200).json({ message: 'Mot de passe mis à jour' });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe', details: err });
    }
});
router.delete('/nuke', verifyToken, (req, res) => {
    const userId = req.user.id;

    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors du début de la transaction', details: err });
        }

        const passwordQuery = `DELETE FROM passwords WHERE user_id = ?`;
        db.query(passwordQuery, [userId], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ error: 'Erreur lors de la suppression des mots de passe', details: err });
                });
            }

            const userQuery = `DELETE FROM users WHERE id = ?`;
            db.query(userQuery, [userId], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur', details: err });
                    });
                }

                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Erreur lors de la validation de la transaction', details: err });
                        });
                    }
                    res.status(200).json({ message: 'Utilisateur supprimé' });
                });
            });
        });
    });
});

module.exports = router;