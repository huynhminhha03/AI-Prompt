const express = require('express');
const cozeController = require("../controllers/CozeController");
const huggingFaceController = require("../controllers/HuggingFaceController");
const jwtMiddleware = require('../middleware/JWTMiddleware');
const checkBalanceMiddleware = require('../middleware/CheckBalanceMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
    "/upload-file",
    upload.single('file'),
    (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ error: 'File is required.' });
        }
        next(); 
    },
    cozeController.uploadFile.bind(cozeController)
);
router.get("/all-bots", cozeController.getModels.bind(cozeController));
router.use(jwtMiddleware());

router.get("/count-conversations", cozeController.countConversations.bind(cozeController));
router.get("/get-balance", cozeController.getBalance.bind(cozeController));
router.get("/create-conversation", cozeController.createConversation.bind(cozeController));

router.use(checkBalanceMiddleware());
router.get("/chat-stream", cozeController.streamChat.bind(cozeController));
router.get("/chat-completion", cozeController.chatCompletion.bind(cozeController));

router.post("/text-to-image", huggingFaceController.textToImage.bind(huggingFaceController));
router.post("/text-to-speech", huggingFaceController.textToSpeech.bind(huggingFaceController));
module.exports = router;