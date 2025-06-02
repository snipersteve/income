const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_DIR = './data';
const DATA_FILE = path.join(DATA_DIR, 'income_data.json');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 确保数据目录和文件存在
async function ensureDataFile() {
    try {
        // 确保data目录存在
        await fs.mkdir(DATA_DIR, { recursive: true });
        // 确保数据文件存在
        await fs.access(DATA_FILE);
    } catch (error) {
        // 文件不存在，创建空数据文件
        await fs.writeFile(DATA_FILE, JSON.stringify({}));
    }
}

// 读取收入数据
app.get('/api/income', async (req, res) => {
    try {
        await ensureDataFile();
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('读取数据失败:', error);
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 保存收入数据
app.post('/api/income', async (req, res) => {
    try {
        const incomeData = req.body;
        
        // 添加备份功能
        const backupFile = path.join(DATA_DIR, `backup_${new Date().toISOString().split('T')[0]}.json`);
        try {
            const existingData = await fs.readFile(DATA_FILE, 'utf8');
            await fs.writeFile(backupFile, existingData);
        } catch (backupError) {
            console.warn('创建备份失败:', backupError);
        }
        
        // 保存新数据
        await fs.writeFile(DATA_FILE, JSON.stringify(incomeData, null, 2));
        res.json({ success: true, message: '数据保存成功' });
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ error: '保存数据失败' });
    }
});

// 获取备份列表
app.get('/api/backups', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR);
        const backupFiles = files
            .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
            .map(file => ({
                name: file,
                date: file.replace('backup_', '').replace('.json', '')
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
        
        res.json(backupFiles);
    } catch (error) {
        console.error('获取备份列表失败:', error);
        res.status(500).json({ error: '获取备份列表失败' });
    }
});

// 恢复备份
app.post('/api/restore/:filename', async (req, res) => {
    try {
        const filename = path.join(DATA_DIR, req.params.filename);
        const backupData = await fs.readFile(filename, 'utf8');
        await fs.writeFile(DATA_FILE, backupData);
        res.json({ success: true, message: '数据恢复成功' });
    } catch (error) {
        console.error('恢复数据失败:', error);
        res.status(500).json({ error: '恢复数据失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`收入统计服务器运行在 http://localhost:${PORT}`);
    console.log('数据将保存在:', path.resolve(DATA_FILE));
});

module.exports = app; 