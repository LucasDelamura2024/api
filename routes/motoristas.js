// routes/motoristas.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Listar todos os motoristas
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT * FROM motoristas 
                ORDER BY last_activity DESC
            `);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao buscar motoristas', 
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

// Buscar motorista específico
router.get('/:driver_id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                'SELECT * FROM motoristas WHERE driver_id = ?', 
                [req.params.driver_id]
            );
            if (rows.length === 0) {
                res.status(404).json({ message: 'Motorista não encontrado' });
            } else {
                res.json(rows[0]);
            }
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao buscar motorista', 
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

// Cadastrar novo motorista
router.post('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const { 
                driver_id, 
                nome, 
                telefone, 
                placa, 
                veiculo, 
                cpf, 
                rota, 
                doca 
            } = req.body;

            const [result] = await connection.query(
                `INSERT INTO motoristas (
                    driver_id, nome, telefone, placa, 
                    veiculo, cpf, rota, doca
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [driver_id, nome, telefone, placa, veiculo, cpf, rota, doca]
            );

            res.status(201).json({ 
                id: result.insertId, 
                message: 'Motorista cadastrado com sucesso' 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao cadastrar motorista', 
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

// Atualizar motorista
router.put('/:driver_id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const { 
                nome, 
                telefone, 
                placa, 
                veiculo, 
                view, 
                ultima_latitude, 
                ultima_longitude, 
                ultimo_endereco, 
                rota, 
                cpf, 
                doca 
            } = req.body;

            const [result] = await connection.query(
                `UPDATE motoristas SET 
                    nome = ?, 
                    telefone = ?, 
                    placa = ?, 
                    veiculo = ?, 
                    view = ?, 
                    ultima_latitude = ?, 
                    ultima_longitude = ?, 
                    ultimo_endereco = ?, 
                    rota = ?, 
                    cpf = ?, 
                    doca = ?,
                    last_activity = CURRENT_TIMESTAMP
                WHERE driver_id = ?`,
                [nome, telefone, placa, veiculo, view, ultima_latitude, 
                 ultima_longitude, ultimo_endereco, rota, cpf, doca, 
                 req.params.driver_id]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ message: 'Motorista não encontrado' });
            } else {
                res.json({ message: 'Motorista atualizado com sucesso' });
            }
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro ao atualizar motorista', 
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