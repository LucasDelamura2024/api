// routes/statusDoca.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Listar status de todas as docas
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT * FROM status_doca 
                ORDER BY data_alteracao DESC
            `);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao buscar status das docas', 
                details: error.message 
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro de conexão', 
            details: error.message 
        });
    }
});

// Buscar status de uma doca específica
router.get('/:doca', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                'SELECT * FROM status_doca WHERE doca = ?',
                [req.params.doca]
            );
            if (rows.length === 0) {
                res.status(404).json({ message: 'Doca não encontrada' });
            } else {
                res.json(rows[0]);
            }
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao buscar status da doca', 
                details: error.message 
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro de conexão', 
            details: error.message 
        });
    }
});

// Registrar novo status de doca
router.post('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const { doca, status } = req.body;

            const [result] = await connection.query(
                'INSERT INTO status_doca (doca, status) VALUES (?, ?)',
                [doca, status]
            );

            res.status(201).json({ 
                id: result.insertId, 
                message: 'Status da doca registrado com sucesso' 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao registrar status da doca', 
                details: error.message 
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro de conexão', 
            details: error.message 
        });
    }
});

// Atualizar status de uma doca