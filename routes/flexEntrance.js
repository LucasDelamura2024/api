const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Buscar todos os registros
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT 
                    id, driver_id, nome, veiculo, placa, tipo, status, 
                    rota, regiao, saida, timestamp, localizacao, 
                    latitude, longitude, view, janela, cpf, phone, doca
                FROM flex_entrance 
                ORDER BY timestamp DESC 
                LIMIT 100
            `);
            res.json(rows);
        } catch (queryError) {
            console.error('Erro na consulta:', queryError);
            res.status(500).json({ 
                error: 'Erro ao buscar registros', 
                details: queryError.message 
            });
        } finally {
            connection.release();
        }
    } catch (connectionError) {
        console.error('Erro de conexão:', connectionError);
        res.status(500).json({ 
            error: 'Erro de conexão com o banco de dados', 
            details: connectionError.message 
        });
    }
});

// Buscar por CPF do motorista
router.get('/driver/:cpf', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT 
                    id, driver_id, nome, veiculo, placa, tipo, status, 
                    rota, regiao, saida, timestamp, localizacao, 
                    latitude, longitude, view, janela, cpf, phone, doca
                FROM flex_entrance 
                WHERE cpf = ? 
                ORDER BY timestamp DESC 
                LIMIT 100
            `, [req.params.cpf]);
            res.json(rows);
        } catch (queryError) {
            console.error('Erro na consulta:', queryError);
            res.status(500).json({ 
                error: 'Erro ao buscar registros do motorista', 
                details: queryError.message 
            });
        } finally {
            connection.release();
        }
    } catch (connectionError) {
        console.error('Erro de conexão:', connectionError);
        res.status(500).json({ 
            error: 'Erro de conexão com o banco de dados', 
            details: connectionError.message 
        });
    }
});

// Buscar por status
router.get('/status/:status', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT 
                    id, driver_id, nome, veiculo, placa, tipo, status, 
                    rota, regiao, saida, timestamp, localizacao, 
                    latitude, longitude, view, janela, cpf, phone, doca
                FROM flex_entrance 
                WHERE status = ? 
                ORDER BY timestamp DESC 
                LIMIT 100
            `, [req.params.status]);
            res.json(rows);
        } catch (queryError) {
            console.error('Erro na consulta:', queryError);
            res.status(500).json({ 
                error: 'Erro ao buscar registros por status', 
                details: queryError.message 
            });
        } finally {
            connection.release();
        }
    } catch (connectionError) {
        console.error('Erro de conexão:', connectionError);
        res.status(500).json({ 
            error: 'Erro de conexão com o banco de dados', 
            details: connectionError.message 
        });
    }
});

// Buscar estatísticas do dia
router.get('/stats/today', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT 
                    COUNT(*) as total_entries,
                    SUM(CASE WHEN status = 'aguardando' THEN 1 ELSE 0 END) as waiting,
                    SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'finalizado' THEN 1 ELSE 0 END) as finished,
                    COUNT(DISTINCT cpf) as unique_drivers
                FROM flex_entrance 
                WHERE DATE(timestamp) = CURDATE()
            `);
            res.json(rows[0]);
        } catch (queryError) {
            console.error('Erro na consulta:', queryError);
            res.status(500).json({ 
                error: 'Erro ao buscar estatísticas', 
                details: queryError.message 
            });
        } finally {
            connection.release();
        }
    } catch (connectionError) {
        console.error('Erro de conexão:', connectionError);
        res.status(500).json({ 
            error: 'Erro de conexão com o banco de dados', 
            details: connectionError.message 
        });
    }
});

// Adicionar nova entrada
router.post('/', async (req, res) => {
    try {
        const { 
            driver_id, nome, veiculo, placa, tipo, status, rota, 
            regiao, saida, localizacao, latitude, longitude, 
            view, janela, cpf, phone, doca
        } = req.body;

        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(`
                INSERT INTO flex_entrance (
                    driver_id, nome, veiculo, placa, tipo, status, rota, 
                    regiao, saida, localizacao, latitude, longitude, 
                    view, janela, cpf, phone, doca
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                driver_id, nome, veiculo, placa, tipo, status, rota, 
                regiao, saida, localizacao, latitude, longitude, 
                view, janela, cpf, phone, doca
            ]);
            
            res.status(201).json({ 
                message: 'Entrada criada com sucesso', 
                id: result.insertId 
            });
        } catch (queryError) {
            console.error('Erro na inserção:', queryError);
            res.status(500).json({ 
                error: 'Erro ao criar nova entrada', 
                details: queryError.message 
            });
        } finally {
            connection.release();
        }
    } catch (connectionError) {
        console.error('Erro de conexão:', connectionError);
        res.status(500).json({ 
            error: 'Erro de conexão com o banco de dados', 
            details: connectionError.message 
        });
    }
});

module.exports = router;