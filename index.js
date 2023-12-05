import path from 'node:path';
await import(path.join(process.cwd(), 'days', `day_${process.argv[2]}.js`)); 