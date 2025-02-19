const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
};

// Criação do pool de conexões
const pool = mysql.createPool(dbConfig);

// Rota de teste da conexão
app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ 
            message: 'API do Check-in Flex está funcionando!',
            status: 'online',
            database: 'conectado' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao conectar com o banco de dados',
            error: error.message 
        });
    }
});

// Rota para buscar todos os registros
app.get('/entries', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT 
                    id, 
                    driver_id, 
                    nome, 
                    veiculo, 
                    placa, 
                    tipo, 
                    status, 
                    rota, 
                    regiao, 
                    saida, 
                    timestamp, 
                    localizacao, 
                    latitude, 
                    longitude, 
                    view, 
                    janela, 
                    cpf,
                    phone,
                    doca
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

// Rota para buscar registros por motorista (CPF)
app.get('/entries/driver/:cpf', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT 
                    id, 
                    driver_id, 
                    nome, 
                    veiculo, 
                    placa, 
                    tipo, 
                    status, 
                    rota, 
                    regiao, 
                    saida, 
                    timestamp, 
                    localizacao, 
                    latitude, 
                    longitude, 
                    view, 
                    janela, 
                    cpf,
                    phone,
                    doca
                FROM flex_entrance 
                WHERE cpf = ? 
                ORDER BY timestamp DESC 
                LIMIT 100`, 
                [req.params.cpf]
            );
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

// Rota para buscar registros por status
app.get('/entries/status/:status', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(`
                SELECT 
                    id, 
                    driver_id, 
                    nome, 
                    veiculo, 
                    placa, 
                    tipo, 
                    status, 
                    rota, 
                    regiao, 
                    saida, 
                    timestamp, 
                    localizacao, 
                    latitude, 
                    longitude, 
                    view, 
                    janela, 
                    cpf,
                    phone,
                    doca
                FROM flex_entrance 
                WHERE status = ? 
                ORDER BY timestamp DESC 
                LIMIT 100`,
                [req.params.status]
            );
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

// Rota para buscar estatísticas do dia
app.get('/stats/today', async (req, res) => {
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

// Rota para adicionar nova entrada
app.post('/entries', async (req, res) => {
    try {
        const { 
            driver_id, 
            nome, 
            veiculo, 
            placa, 
            tipo, 
            status, 
            rota, 
            regiao, 
            saida, 
            localizacao, 
            latitude, 
            longitude, 
            view, 
            janela, 
            cpf,
            phone,
            doca
        } = req.body;

        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(`
                INSERT INTO flex_entrance (
                    driver_id, 
                    nome, 
                    veiculo, 
                    placa, 
                    tipo, 
                    status, 
                    rota, 
                    regiao, 
                    saida, 
                    localizacao, 
                    latitude, 
                    longitude, 
                    view, 
                    janela, 
                    cpf,
                    phone,
                    doca
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    driver_id, 
                    nome, 
                    veiculo, 
                    placa, 
                    tipo, 
                    status, 
                    rota, 
                    regiao, 
                    saida, 
                    localizacao, 
                    latitude, 
                    longitude, 
                    view, 
                    janela, 
                    cpf,
                    phone,
                    doca
                ]
            );
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

// Tratamento de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
