/**
 * run with args: day, part
 */
import path from 'node:path';
if(!process.argv[2]){
    console.log("no day number provided; exiting.");
    process.exit();
}
try {
    await import(path.join(process.cwd(), 'days', `day_${process.argv[2]}.js`)); 
} catch(error){
    console.log("invalid day number provided; exiting.");
}
