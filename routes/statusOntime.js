// routes/statusOntime.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Listar todos os registros de status
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT * FROM status_ontime 
                ORDER BY timestamp DESC
            `);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao buscar registros de status', 
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

// Buscar status por motorista
router.get('/driver/:driver_id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM status_ontime 
                WHERE driver_id = ? 
                ORDER BY timestamp DESC`,
                [req.params.driver_id]
            );
            res.json(rows);
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao buscar status do motorista', 
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

// Buscar status por tipo
router.get('/tipo/:tipo', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM status_ontime 
                WHERE tipo = ? 
                ORDER BY timestamp DESC`,
                [req.params.tipo]
            );
            res.json(rows);
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao buscar status por tipo', 
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

// Criar novo registro de status
router.post('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const { 
                driver_id, 
                nome, 
                rota, 
                doca, 
                tipo, 
                status, 
                quant_pct 
            } = req.body;

            const [result] = await connection.query(
                `INSERT INTO status_ontime (
                    driver_id, nome, rota, doca, 
                    tipo, status, quant_pct
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [driver_id, nome, rota, doca, tipo, status, quant_pct]
            );

            res.status(201).json({ 
                id: result.insertId, 
                message: 'Status registrado com sucesso' 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao registrar status', 
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

// Atualizar status
router.put('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const { status, quant_pct } = req.body;

            const [result] = await connection.query(
                `UPDATE status_ontime SET 
                    status = ?, 
                    quant_pct = ? 
                WHERE id = ?`,
                [status, quant_pct, req.params.id]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ message: 'Registro não encontrado' });
            } else {
                res.json({ message: 'Status atualizado com sucesso' });
            }
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao atualizar status', 
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

module.exports = router;