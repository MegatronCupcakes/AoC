/**
 * run with args: day, part
 */
import path from 'node:path';
if(process.env.TEST_MODE == 'true'){
    // run current working file; TEST_MODE set in launch.json
    await import(path.join(process.cwd(), 'days', `day_4.js`));
} else {
    if(!process.argv[2]){
        console.log("no day number provided; exiting.");
        process.exit();
    }
    await import(path.join(process.cwd(), 'days', `day_${process.argv[2]}.js`)); 
}