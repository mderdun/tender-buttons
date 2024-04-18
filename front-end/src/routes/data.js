// src/routes/data.js
import fs from 'fs';
import path from 'path';

export async function get(req) {
    const csvText = fs.readFileSync(path.resolve('./src/lib/data/list.csv'), 'utf-8');
    return {
        body: csvText
    };
}