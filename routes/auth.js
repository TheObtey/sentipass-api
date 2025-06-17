const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authController = require('../controllers/authController');
const db = require('../db');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/nuke', verifyToken, (req, res) => {
    const userId = req.user.id;

    const passwordQuery = `DELETE FROM passwords WHERE user_id = ?`;

    db.query(passwordQuery, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression des mots de passe', details: err });
        }

        const userQuery = `DELETE FROM users WHERE id = ?`;

        db.query(userQuery, [userId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur', details: err });
            }
    
            res.status(200).json({ message: 'Utilisateur supprimé' });
        });
    });
});

module.exports = router;