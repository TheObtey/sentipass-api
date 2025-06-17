const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

exports.register = async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: 'Champs requis manquants' });
	}

	try {
		const hash = await bcrypt.hash(password, 10);

		db.query('INSERT INTO users (username, password, password_hash) VALUES (?, ?, ?)', [username, password, hash],
			(err, result) => {
			if (err) {
				if (err.code === 'ER_DUP_ENTRY') {
					return res.status(409).json({ error: 'Nom d\'utilisateur déjà utilisé' });
				}
				return res.status(500).json({ error: 'Erreur serveur', details: err });
			}

				res.status(201).json({ message: 'Utilisateur créé', userId: result.insertId });
			}
		);
	} catch (e) {
		res.status(500).json({ error: 'Erreur interne', details: e });
	}
};

exports.login = (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: 'Champs requis manquants'  });
	}

	db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Erreur serveur', details: err });
		}

		if (results.length === 0) {
			return res.status(404).json({ error: 'Utilisateur introuvable' });
		}

		const user = results[0];
		const isMatch =  await bcrypt.compare(password, user.password_hash);

		if (!isMatch) {
			return res.status(401).json({ error: 'Mot de passe incorrecte' });
		}

		const token = jwt.sign(
			{ id: user.id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_LIFETIME }
		);

		res.status(200).json({ message: 'Connexion réussie', token });
	});
};