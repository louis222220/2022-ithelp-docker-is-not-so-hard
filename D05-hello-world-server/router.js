import Router from 'express';


const router = Router();

router.get('/', function(req, res) {
	return res.json({ hello: "world" });
});

router.post('/', function(req, res) {
	return res.json({
		hello: "world",
		input: req.body,
	});
});

router.get('/hola', function(req, res) {
	return res.json({ hola: "world" });
});

export default router;

