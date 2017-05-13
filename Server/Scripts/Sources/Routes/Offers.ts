﻿import { Offer } from "../Classes";
{
    const offers = require("express").Router(), parser = require("body-parser"), db = require("../Mongodb");
    offers
        .use(parser.json())
        .use(parser.urlencoded({ extended: true }))
        .get("/", (req, res) => db.Offers.Read(null, response => res.json(response)))
        .get("/:id", (req, res) => db.Offers.Read({ _id: req.body.id }, response => res.json(response)))
        .delete("/:id", (req, res) => db.Offers.Delete({ _id: req.params.id }, response => res.json(response)))
        .post("/",
        (req, res) => {
            const offer = new Offer(db.objectId(),
                req.body.image,
                req.body.description,
                req.body.meal,
                req.body.discount,
                req.body.duration,
                req.body.startDate);
            db.Offers.Create(offer, response => res.json(response));
        })
        .put("/",
        (req, res) => {
            const offer = new Offer(req.body._id,
                req.body.image,
                req.body.description,
                req.body.meal,
                req.body.discount,
                req.body.duration,
                req.body.startDate);
            db.Offers.Update(offer, response => res.json(response));
        });
    module.exports = offers;
}