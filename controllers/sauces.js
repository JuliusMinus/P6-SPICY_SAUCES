const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  const idSauce = req.params.id;

  Sauce.findOne({ _id: idSauce }).then((sauce) => {
    const idIncluded =
      !sauce.usersLiked.includes(req.body.userId) &&
      !sauce.usersDisliked.includes(req.body.userId);
    if (like === 1 && idIncluded) {
      Sauce.updateOne(
        { _id: idSauce },
        {
          $push: { usersLiked: req.body.userId },
          $inc: { likes: +1 },
        }
      )
        .then(() => res.status(200).json({ message: "like ajouté !" }))
        .catch((error) => res.status(400).json({ error }));
    } else if (like === -1 && idIncluded) {
      Sauce.updateOne(
        { _id: idSauce },
        {
          $push: { usersDisliked: req.body.userId },
          $inc: { dislikes: +1 },
        }
      )
        .then(() => res.status(200).json({ message: "dislike ajoutée !" }))
        .catch((error) => res.status(400).json({ error }));
    } else {
      if (sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: idSauce },
          {
            $pull: { usersLiked: req.body.userId },
            $inc: { likes: -1 },
          }
        )
          .then(() => res.status(200).json({ message: "like retiré !" }))
          .catch((error) => res.status(400).json({ error }));
      } else if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: idSauce },
          {
            $pull: { usersDisliked: req.body.userId },
            $inc: { dislikes: -1 },
          }
        )
          .then(() => res.status(200).json({ message: "dislike retiré !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    }
  });
};
