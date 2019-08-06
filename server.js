const express = require('express');
const app = express();
const bodyParser = require('body-parser');
let data = require('./jobs');
//Ajoutons notre post
let initialJobs = data.jobs;
let addedJobs = [];

//on se cree un user pour tester le token un petit objet
const fakeUser = {email: 'ehueni.angora@gmail.com', password: 'aze'};
const secret = 'qsdjS12ozehdoIJ123DJOZJLDSCqsdeffdg123ER56SDFZedhWXojqshduzaohduihqsDAqsdq';
//const jwt = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
//c:/Users/DELL/AppData/Local/Microsoft/Typescript/3.0/node_modules/@types/jsonwebtoken/index
const getAllJobs = () => {
    return [...addedJobs, ...initialJobs];
}
//console.log('jobs:', data.jobs);
//  permet d'utiliser le midleware
app.use(bodyParser.json());
//avec la méthode use On cree notre middleware
app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, '*');//acces depuis n'importe quelle url
    res.header(`Access-Control-Allow-Headers`, 'Content-Type, Authorization');
    next();
    
});

const api = express.Router();
const auth = express.Router();

auth.post('/login', (req, res) => {
    if(req.body) {
        const email = req.body.email.toLocaleLowerCase();
        const password = req.body.password.toLocaleLowerCase();
        if(email === fakeUser.email && password === fakeUser.password) {
            delete req.body.password;
            //res.json({ success: true, data: req.body});
            const token = jwt.sign({ iss: 'http://localhost:4201', role: 'admin', email: req.body.email }, secret);
            res.json({ success: true, token: token });
        } else {
            res.json({ success: false, message: 'identifiants incorrects'});
        }
        } else {
            res.json({ success: false, message: 'données manquantes'});
        }
})

api.get('/jobs', (req, res) => {
    //res.json({success: true, message: "Hello world"});
    //res.json(data.jobs);
    res.json(getAllJobs());

});
//Lire du Post sur l'url
api.post('/jobs', (req, res) =>{
    console.log('***********');
    const job = req.body;
    addedJobs = [job, ...addedJobs];
    console.log('Total nb of jobs: ',getAllJobs().length);
    res.json(job);//on retourne le même job

});

api.get('/search/:term/:place?', (req, res) =>{
    const term = req.params.term.toLowerCase().trim();
    let place = req.params.place;
    let jobs = getAllJobs().filter(j =>(j.description.toLowerCase().includes(term) || j.title.toLowerCase().includes(term) ));
    if(place){
        place = place.toLowerCase().trim();
        jobs = jobs.filter(j=> (j.city.toLowerCase().includes(place))); 
    }
    res.json({ success: true, jobs});
});

api.get('/jobs/:id', (req, res) => {
    //const id = req.params.id;//recupère chaque id
    const id = parseInt(req.params.id, 10); //permet de comparer les id
    const job = getAllJobs().filter(j => j.id === id);
    //verifions la longueur du tableau
    if(job.length === 1) {
        res.json({success: true, job: job[0]});
    }else{
        res.json({success: false, message: `pas de job ayant pour id ${id}`});
    }
});
//Au lieu de faire une requete sur localhost ce sera sur localhost:4002/api/jobs
app.use('/api', api);

const port = 4201;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});