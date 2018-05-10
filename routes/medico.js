// Requires
var express = require("express");
var Medico = require("../models/medico");
var jwt = require("jsonwebtoken");
var mdAutenticacion = require("../middlewares/autenticacion");

// Inicializar variables
var app = express();

// ============================================
// Obtener todos los médicos
// ============================================
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando medicos",
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

// ============================================
// Crear un nuevo medico
// ============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el médico",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medicoGuardado: medicoGuardado
        });
    });

});

// ============================================
// Actualizar Medico
// ============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar médico",
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El médico con el id " + id + " no existe",
                errors: { message: 'No existe un médico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar médico",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ============================================
// Eliminar usuarios por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al borrar medico",
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un médico con el ID " + id,
                errors: { message: 'No existe un médico con ese ID ' + id }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });
    });
});

module.exports = app;