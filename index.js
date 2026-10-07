import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    initAuthCreds,
} from '@whiskeysockets/baileys';

import { MongoClient } from 'mongodb';

import {
    Handler,
    Callupdate,
    GroupUpdate
} from './data/index.js';

import express from 'express';
import pino from 'pino';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';

const {
    emojis,
    doReact
} = pkg;


// ══════════════════════════════════════════════════════════════
// BASIC CONFIGURATION
// ══════════════════════════════════════════════════════════════

const app = express();

const PORT =
    process.env.PORT || 3000;

const orange =
    chalk.bold.hex('#FFA500');

const lime =
    chalk.bold.hex('#32CD32');

let initialConnection = true;

let activeConn = null;

let isConnecting = false;

let shuttingDown = false;

let reconnectTimer = null;

let reconnectAttempts = 0;

let socketGeneration = 0;

const msgRetryCounterCache =
    new NodeCache();


// ══════════════════════════════════════════════════════════════
// MONGODB CONFIGURATION
// ══════════════════════════════════════════════════════════════

// Keep the MongoDB credentials directly in this file.
// Do NOT move this to BeraHost environment variables.

const MONGODB_URI =
    'mongodb+srv://ellyongiro8:QwXDXE6tyrGpUTNb@cluster0.tyxcmm9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const MONGODB_DB =
    'cloud_ai';

const MONGODB_COLLECTION =
    'baileys_auth';

const MONGODB_SESSIONS_COLLECTION =
    'baileys_sessions';


// ══════════════════════════════════════════════════════════════
// MONGODB STATE
// ══════════════════════════════════════════════════════════════

let mongoClient = null;

let mongoDb = null;

let mongoCollection = null;

let mongoSessionsCollection = null;

let mongoConnecting = null;


// ══════════════════════════════════════════════════════════════
// CURRENT SESSION
// ══════════════════════════════════════════════════════════════

let currentSessionId = null;


// ══════════════════════════════════════════════════════════════
// LOGGER
// ══════════════════════════════════════════════════════════════

const MAIN_LOGGER = pino({
    timestamp: () =>
        `,"time":"${new Date().toJSON()}"`
});

const logger =
    MAIN_LOGGER.child({});

logger.level = 'trace';


// ══════════════════════════════════════════════════════════════
// PATH
// ══════════════════════════════════════════════════════════════

const __filename =
    new URL(import.meta.url).pathname;

const __dirname =
    path.dirname(__filename);


// ══════════════════════════════════════════════════════════════
// BANNER
// ══════════════════════════════════════════════════════════════

console.log(
    orange(`
╔══════════════════════════════════╗
║          BERA TECH BOT           ║
║       MongoDB Authentication     ║
╚══════════════════════════════════╝
`)
);

console.log(
    chalk.gray(
        `📦 MongoDB database : ${MONGODB_DB}`
    )
);

console.log(
    chalk.gray(
        `📁 MongoDB auth collection : ${MONGODB_COLLECTION}`
    )
);

console.log(
    chalk.gray(
        `📁 MongoDB session registry : ${MONGODB_SESSIONS_COLLECTION}`
    )
);

console.log(
    chalk.gray(
        '🔑 MongoDB session mode : UNIQUE PER PAIRING'
    )
);

console.log(
    chalk.gray(
        '💾 WhatsApp authentication: MongoDB'
    )
);

console.log(
    chalk.gray(
        '☁️ BeraHost local session dependency: disabled'
    )
);


// ══════════════════════════════════════════════════════════════
// SERIALIZATION
// ══════════════════════════════════════════════════════════════

function serializeMongoValue(value) {

    if (Buffer.isBuffer(value)) {
        return {
            __type: 'Buffer',
            data: value.toString('base64')
        };
    }

    if (value instanceof Uint8Array) {
        return {
            __type: 'Buffer',
            data: Buffer
                .from(value)
                .toString('base64')
        };
    }

    if (Array.isArray(value)) {
        return value.map(
            serializeMongoValue
        );
    }

    if (
        value &&
        typeof value === 'object'
    ) {
        const output = {};

        for (
            const [key, val]
            of Object.entries(value)
        ) {
            output[key] =
                serializeMongoValue(val);
        }

        return output;
    }

    return value;
}


function deserializeMongoValue(value) {

    if (
        value &&
        typeof value === 'object' &&
        value.__type === 'Buffer' &&
        typeof value.data === 'string'
    ) {
        return Buffer.from(
            value.data,
            'base64'
        );
    }

    if (Array.isArray(value)) {
        return value.map(
            deserializeMongoValue
        );
    }

    if (
        value &&
        typeof value === 'object'
    ) {
        const output = {};

        for (
            const [key, val]
            of Object.entries(value)
        ) {
            output[key] =
                deserializeMongoValue(val);
        }

        return output;
    }

    return value;
}


// ══════════════════════════════════════════════════════════════
// CONNECT MONGODB
// ══════════════════════════════════════════════════════════════

async function connectMongo() {

    if (mongoDb) {
        return mongoDb;
    }

    if (mongoConnecting) {
        return mongoConnecting;
    }

    mongoConnecting =
        (async () => {

            console.log(
                chalk.cyan(
                    '🔌 Connecting to MongoDB...'
                )
            );

            mongoClient =
                new MongoClient(
                    MONGODB_URI,
                    {
                        serverSelectionTimeoutMS: 30000,
                        connectTimeoutMS: 30000,
                        socketTimeoutMS: 30000,
                        maxPoolSize: 10,
                        retryWrites: true
                    }
                );

            await mongoClient.connect();

            mongoDb =
                mongoClient.db(
                    MONGODB_DB
                );

            mongoCollection =
                mongoDb.collection(
                    MONGODB_COLLECTION
                );

            mongoSessionsCollection =
                mongoDb.collection(
                    MONGODB_SESSIONS_COLLECTION
                );

            await mongoCollection.createIndex(
                {
                    sessionId: 1,
                    type: 1,
                    key: 1
                },
                {
                    unique: true
                }
            );

            await mongoSessionsCollection.createIndex(
                {
                    sessionId: 1
                },
                {
                    unique: true
                }
            );

            await mongoSessionsCollection.createIndex(
                {
                    status: 1
                }
            );

            console.log(
                lime(
                    '✅ MongoDB connected'
                )
            );

            console.log(
                chalk.gray(
                    `📦 Database: ${MONGODB_DB}`
                )
            );

            return mongoDb;
        })();

    try {
        return await mongoConnecting;
    } finally {
        mongoConnecting = null;
    }
}


// ══════════════════════════════════════════════════════════════
// UNIQUE SESSION ID
// ══════════════════════════════════════════════════════════════

function createSessionId() {

    const timestamp =
        Date.now().toString(36);

    const random =
        Math.random()
            .toString(36)
            .slice(2, 10);

    return `bera-tech-${timestamp}-${random}`;
}


// ══════════════════════════════════════════════════════════════
// SESSION REGISTRY
// ══════════════════════════════════════════════════════════════

async function registerSession(
    sessionId,
    status = 'pending'
) {

    await connectMongo();

    await mongoSessionsCollection.updateOne(
        {
            sessionId
        },
        {
            $set: {
                sessionId,
                status,
                updatedAt: new Date()
            },
            $setOnInsert: {
                createdAt: new Date()
            }
        },
        {
            upsert: true
        }
    );
}


async function updateSessionStatus(
    sessionId,
    status
) {

    if (!sessionId) {
        return;
    }

    await connectMongo();

    await mongoSessionsCollection.updateOne(
        {
            sessionId
        },
        {
            $set: {
                status,
                updatedAt: new Date()
            }
        },
        {
            upsert: true
        }
    );
}


async function getActiveSession() {

    await connectMongo();

    const session =
        await mongoSessionsCollection.findOne(
            {
                status: 'active'
            },
            {
                sort: {
                    updatedAt: -1
                }
            }
        );

    return session;
}


async function retirePendingSessions() {

    await connectMongo();

    await mongoSessionsCollection.updateMany(
        {
            status: 'pending'
        },
        {
            $set: {
                status: 'failed',
                updatedAt: new Date()
            }
        }
    );
}


// ══════════════════════════════════════════════════════════════
// CREATE NEW SESSION
// ══════════════════════════════════════════════════════════════

async function createNewSession() {

    await connectMongo();

    const sessionId =
        createSessionId();

    await registerSession(
        sessionId,
        'pending'
    );

    currentSessionId =
        sessionId;

    console.log(
        chalk.cyan(
            `🆕 New MongoDB session created: ${sessionId}`
        )
    );

    return sessionId;
}


// ══════════════════════════════════════════════════════════════
// MONGODB BAILEYS AUTH STATE
// ══════════════════════════════════════════════════════════════

async function useMongoAuthState(
    sessionId
) {

    await connectMongo();

    const credsDocument =
        await mongoCollection.findOne(
            {
                sessionId,
                type: 'creds'
            }
        );

    let creds;

    if (
        credsDocument &&
        credsDocument.data
    ) {

        creds =
            deserializeMongoValue(
                credsDocument.data
            );

    } else {

        creds =
            initAuthCreds();

        console.log(
            chalk.yellow(
                '🆕 No existing WhatsApp credentials found for this MongoDB session.'
            )
        );
    }


    const keys = {

        async get(
            type,
            ids
        ) {

            const result = {};

            if (
                !ids ||
                !ids.length
            ) {
                return result;
            }

            const documents =
                await mongoCollection
                    .find({
                        sessionId,
                        type:
                            `key:${type}`,
                        key: {
                            $in: ids
                        }
                    })
                    .toArray();

            for (
                const id of ids
            ) {

                const document =
                    documents.find(
                        item =>
                            item.key === id
                    );

                if (
                    document &&
                    document.data !== undefined
                ) {

                    result[id] =
                        deserializeMongoValue(
                            document.data
                        );
                }
            }

            return result;
        },


        async set(data) {

            const operations = [];

            for (
                const [
                    type,
                    values
                ]
                of Object.entries(data)
            ) {

                for (
                    const [
                        id,
                        value
                    ]
                    of Object.entries(
                        values || {}
                    )
                ) {

                    const documentType =
                        `key:${type}`;

                    if (
                        value === null ||
                        value === undefined
                    ) {

                        operations.push({
                            deleteOne: {
                                filter: {
                                    sessionId,
                                    type:
                                        documentType,
                                    key: id
                                }
                            }
                        });

                    } else {

                        operations.push({
                            updateOne: {
                                filter: {
                                    sessionId,
                                    type:
                                        documentType,
                                    key: id
                                },

                                update: {
                                    $set: {
                                        sessionId,
                                        type:
                                            documentType,
                                        key: id,
                                        data:
                                            serializeMongoValue(
                                                value
                                            ),
                                        updatedAt:
                                            new Date()
                                    }
                                },

                                upsert: true
                            }
                        });
                    }
                }
            }

            if (
                operations.length
            ) {

                await mongoCollection.bulkWrite(
                    operations,
                    {
                        ordered: false
                    }
                );
            }
        }
    };


    async function saveCreds() {

        await mongoCollection.updateOne(
            {
                sessionId,
                type: 'creds'
            },

            {
                $set: {
                    sessionId,
                    type: 'creds',
                    data:
                        serializeMongoValue(
                            creds
                        ),
                    updatedAt:
                        new Date()
                }
            },

            {
                upsert: true
            }
        );
    }


    return {

        state: {

            creds,

            keys:
                makeCacheableSignalKeyStore(
                    keys,
                    pino({
                        level: 'warn'
                    })
                )
        },

        saveCreds
    };
}


// ══════════════════════════════════════════════════════════════
// CLEAR SESSION AUTH
// ══════════════════════════════════════════════════════════════

async function clearMongoSession(
    sessionId
) {

    if (!sessionId) {
        return;
    }

    try {

        await connectMongo();

        await mongoCollection.deleteMany(
            {
                sessionId
            }
        );

        console.log(
            chalk.yellow(
                `🗑️ MongoDB authentication cleared for ${sessionId}`
            )
        );

    } catch (error) {

        console.error(
            chalk.red(
                `❌ Failed to clear MongoDB session: ${error.message}`
            )
        );
    }
}


// ══════════════════════════════════════════════════════════════
// RECONNECT CONTROL
// ══════════════════════════════════════════════════════════════

function scheduleReconnect(
    reason,
    delay = null
) {

    if (shuttingDown) {
        return;
    }

    if (reconnectTimer) {
        return;
    }

    reconnectAttempts++;

    const reconnectDelay =
        delay ??
        Math.min(
            5000 *
            Math.pow(
                1.5,
                reconnectAttempts - 1
            ),
            60000
        );

    console.log(
        chalk.yellow(
            `🔄 ${reason} — reconnect attempt ${reconnectAttempts} in ${Math.round(reconnectDelay / 1000)}s...`
        )
    );

    reconnectTimer =
        setTimeout(
            async () => {

                reconnectTimer =
                    null;

                if (shuttingDown) {
                    return;
                }

                try {

                    await start();

                } catch (error) {

                    console.error(
                        chalk.red(
                            `[RECONNECT ERROR] ${error.message}`
                        )
                    );

                    scheduleReconnect(
                        'Reconnect failed'
                    );
                }

            },
            reconnectDelay
        );
}


// ══════════════════════════════════════════════════════════════
// START WHATSAPP
// ══════════════════════════════════════════════════════════════

async function start(
    forcedSessionId = null
) {

    if (shuttingDown) {
        return;
    }

    if (isConnecting) {
        return;
    }

    if (activeConn) {
        return;
    }

    isConnecting = true;

    const generation =
        ++socketGeneration;

    let sessionId =
        forcedSessionId ||
        currentSessionId;

    try {

        // ──────────────────────────────────────────────
        // MONGODB
        // ──────────────────────────────────────────────

        await connectMongo();


        // ──────────────────────────────────────────────
        // FIND ACTIVE SESSION
        // ──────────────────────────────────────────────

        if (!sessionId) {

            const activeSession =
                await getActiveSession();

            if (activeSession) {

                sessionId =
                    activeSession.sessionId;

                console.log(
                    chalk.cyan(
                        `♻️ Restoring active MongoDB session: ${sessionId}`
                    )
                );

            } else {

                // Do not reuse old pending pairing sessions.
                await retirePendingSessions();

                sessionId =
                    await createNewSession();
            }
        }

        currentSessionId =
            sessionId;


        // ──────────────────────────────────────────────
        // AUTH STATE
        // ──────────────────────────────────────────────

        const {
            state,
            saveCreds
        } =
            await useMongoAuthState(
                sessionId
            );

        const wasRegistered =
            Boolean(
                state.creds.registered
            );


        // ──────────────────────────────────────────────
        // BAILEYS VERSION
        // ──────────────────────────────────────────────

        const {
            version,
            isLatest
        } =
            await fetchLatestBaileysVersion();

        console.log(
            `demon-slayer using WA v${version.join('.')}, isLatest: ${isLatest}`
        );


        // ──────────────────────────────────────────────
        // SOCKET
        // ──────────────────────────────────────────────

        const Matrix =
            makeWASocket({

                version,

                logger:
                    pino({
                        level: 'silent'
                    }),

                printQRInTerminal: false,

                browser:
                    Browsers.ubuntu(
                        'Chrome'
                    ),

                auth: state,

                msgRetryCounterCache,

                syncFullHistory: false,

                markOnlineOnConnect: true,

                connectTimeoutMs:
                    90000,

                defaultQueryTimeoutMs:
                    60000,

                keepAliveIntervalMs:
                    20000,

                getMessage:
                    async key => {

                        return {
                            conversation:
                                'bera tech bot whatsapp user bot'
                        };
                    }
            });


        activeConn =
            Matrix;

        isConnecting =
            false;


        // ══════════════════════════════════════════════
        // CONNECTION UPDATE
        // ══════════════════════════════════════════════

        Matrix.ev.on(
            'connection.update',
            async update => {

                if (
                    generation !==
                    socketGeneration
                ) {
                    return;
                }

                const {
                    connection,
                    lastDisconnect
                } = update;


                // ──────────────────────────────────────
                // OPEN
                // ──────────────────────────────────────

                if (
                    connection === 'open'
                ) {

                    reconnectAttempts = 0;

                    if (
                        currentSessionId
                    ) {

                        await updateSessionStatus(
                            currentSessionId,
                            'active'
                        );
                    }

                    if (
                        initialConnection
                    ) {

                        console.log(
                            chalk.green(
                                'BERA TECH CONNECTED SUCCESSFUL'
                            )
                        );

                        try {

                            await Matrix.sendMessage(
                                Matrix.user.id,
                                {
                                    image: {
                                        url:
                                            'https://files.catbox.moe/ldetco.jpg'
                                    },

                                    caption:
`╭─────────────━┈⊷
│ *ʙᴇʀᴀ ᴛᴇᴄʜ ʙᴏᴛ*
╰─────────────━┈⊷

╭─────────────━┈⊷
│ *ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ*
│ ⚠️ Join our support group to avoid disconnection:
│🔗 https://chat.whatsapp.com/JLFAlCXdXMh8lT4sxHplvG
│
╰─────────────━┈⊷

> *ʀᴇɢᴀʀᴅs ʙᴇʀᴀ ᴛᴇᴄʜ*`
                                }
                            );

                        } catch (error) {

                            console.error(
                                'Failed to send startup message:',
                                error.message
                            );
                        }

                        initialConnection =
                            false;

                    } else {

                        console.log(
                            chalk.blue(
                                'Connection reestablished after restart.'
                            )
                        );
                    }

                    return;
                }


                // ──────────────────────────────────────
                // CLOSE
                // ──────────────────────────────────────

                if (
                    connection === 'close'
                ) {

                    if (
                        activeConn === Matrix
                    ) {
                        activeConn = null;
                    }

                    const statusCode =
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode;


                    // ────────────────────────────────
                    // GENUINE LOGOUT
                    // ────────────────────────────────

                    if (
                        statusCode ===
                        DisconnectReason.loggedOut
                    ) {

                        console.log(
                            chalk.red(
                                '❌ WhatsApp session logged out.'
                            )
                        );

                        await updateSessionStatus(
                            sessionId,
                            'logged_out'
                        );

                        await clearMongoSession(
                            sessionId
                        );

                        currentSessionId =
                            null;

                        scheduleReconnect(
                            'Logged out — creating a new session',
                            3000
                        );

                        return;
                    }


                    // ────────────────────────────────
                    // 401 ON UNREGISTERED SESSION
                    // ────────────────────────────────

                    if (
                        statusCode === 401 &&
                        !wasRegistered
                    ) {

                        console.log(
                            chalk.yellow(
                                '⚠️ Unregistered pairing session rejected by WhatsApp.'
                            )
                        );

                        await updateSessionStatus(
                            sessionId,
                            'failed'
                        );

                        await clearMongoSession(
                            sessionId
                        );

                        currentSessionId =
                            null;

                        scheduleReconnect(
                            'Creating a fresh pairing session',
                            3000
                        );

                        return;
                    }


                    // ────────────────────────────────
                    // TEMPORARY DISCONNECT
                    // ────────────────────────────────

                    console.log(
                        chalk.yellow(
                            `⚠️ WhatsApp connection closed. Code: ${statusCode ?? 'unknown'}`
                        )
                    );

                    console.log(
                        chalk.cyan(
                            '♻️ Reconnecting using the SAME MongoDB session...'
                        )
                    );

                    scheduleReconnect(
                        'Temporary WhatsApp disconnect'
                    );
                }
            }
        );


        // ══════════════════════════════════════════════
        // CREDENTIAL UPDATE
        // ══════════════════════════════════════════════

        Matrix.ev.on(
            'creds.update',
            saveCreds
        );


        // ══════════════════════════════════════════════
        // MAIN MESSAGE HANDLER
        // ══════════════════════════════════════════════

        Matrix.ev.on(
            'messages.upsert',
            async chatUpdate => {

                try {

                    await Handler(
                        chatUpdate,
                        Matrix,
                        logger
                    );

                } catch (error) {

                    console.error(
                        'Handler error:',
                        error.message
                    );
                }
            }
        );


        // ══════════════════════════════════════════════
        // CALL HANDLER
        // ══════════════════════════════════════════════

        Matrix.ev.on(
            'call',
            async json => {

                try {

                    await Callupdate(
                        json,
                        Matrix
                    );

                } catch (error) {

                    console.error(
                        'Call handler error:',
                        error.message
                    );
                }
            }
        );


        // ══════════════════════════════════════════════
        // GROUP UPDATE
        // ══════════════════════════════════════════════

        Matrix.ev.on(
            'group-participants.update',
            async messag => {

                try {

                    await GroupUpdate(
                        Matrix,
                        messag
                    );

                } catch (error) {

                    console.error(
                        'Group update error:',
                        error.message
                    );
                }
            }
        );


        // ══════════════════════════════════════════════
        // PUBLIC / PRIVATE MODE
        // ══════════════════════════════════════════════

        if (
            config.MODE === 'public'
        ) {

            Matrix.public = true;

        } else if (
            config.MODE === 'private'
        ) {

            Matrix.public = false;
        }


        // ══════════════════════════════════════════════
        // AUTO REACT + STATUS VIEW
        // ══════════════════════════════════════════════

        Matrix.ev.on(
            'messages.upsert',
            async chatUpdate => {

                try {

                    const mek =
                        chatUpdate.messages?.[0];

                    if (!mek) {
                        return;
                    }


                    // ────────────────────────────────
                    // AUTO REACT
                    // ────────────────────────────────

                    if (
                        !mek.key.fromMe &&
                        config.AUTO_REACT
                    ) {

                        const randomEmoji =
                            emojis[
                                Math.floor(
                                    Math.random() *
                                    emojis.length
                                )
                            ];

                        await doReact(
                            randomEmoji,
                            mek,
                            Matrix
                        );
                    }


                    // ────────────────────────────────
                    // STATUS VIEW
                    // ────────────────────────────────

                    if (
                        mek.key.remoteJid &&
                        mek.key.remoteJid.endsWith(
                            '@broadcast'
                        ) &&
                        mek.message?.imageMessage
                    ) {

                        try {

                            await Matrix.readMessages(
                                [
                                    mek.key
                                ]
                            );

                            console.log(
                                chalk.green(
                                    `✅ Viewed status from ${mek.key.participant || mek.key.remoteJid}`
                                )
                            );

                        } catch (error) {

                            console.error(
                                '❌ Error marking status as viewed:',
                                error.message
                            );
                        }
                    }

                } catch (err) {

                    console.error(
                        'Error during auto reaction/status viewing:',
                        err.message
                    );
                }
            }
        );


    } catch (error) {

        isConnecting = false;

        if (
            activeConn &&
            generation === socketGeneration
        ) {

            activeConn =
                null;
        }

        console.error(
            chalk.red(
                'Critical Error:'
            ),
            error.message
        );

        scheduleReconnect(
            'Connection startup failed'
        );
    }
}


// ══════════════════════════════════════════════════════════════
// STARTUP
// ══════════════════════════════════════════════════════════════

async function init() {

    try {

        await connectMongo();

        const activeSession =
            await getActiveSession();


        if (activeSession) {

            currentSessionId =
                activeSession.sessionId;

            console.log(
                chalk.cyan(
                    `♻️ Active WhatsApp session found: ${currentSessionId}`
                )
            );

            await start(
                currentSessionId
            );

        } else {

            console.log(
                chalk.yellow(
                    '📭 No active WhatsApp session found.'
                )
            );

            await retirePendingSessions();

            currentSessionId =
                await createNewSession();

            console.log(
                chalk.cyan(
                    `🆕 New pairing session ready: ${currentSessionId}`
                )
            );

            await start(
                currentSessionId
            );
        }

    } catch (error) {

        console.error(
            chalk.red(
                '❌ Startup failed:'
            ),
            error.message
        );

        scheduleReconnect(
            'MongoDB/startup failure',
            5000
        );
    }
}


// ══════════════════════════════════════════════════════════════
// KEEPALIVE SERVER
// ══════════════════════════════════════════════════════════════

app.get(
    '/',
    (req, res) => {

        res.send(
            'CONNECTED SUCCESSFULL'
        );
    }
);


app.listen(
    PORT,
    () => {

        console.log(
            `Server is running on port ${PORT}`
        );
    }
);


// ══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ══════════════════════════════════════════════════════════════

async function shutdown(
    signal
) {

    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    console.log(
        chalk.yellow(
            `\n🛑 ${signal} received — shutting down...`
        )
    );


    if (reconnectTimer) {

        clearTimeout(
            reconnectTimer
        );

        reconnectTimer =
            null;
    }


    try {

        if (activeConn) {

            try {
                activeConn.ev.removeAllListeners();
            } catch {}

            try {

                if (
                    activeConn.ws
                ) {
                    activeConn.ws.close();
                }

            } catch {}

            activeConn =
                null;
        }

    } catch {}


    try {

        if (mongoClient) {

            await mongoClient.close();

            console.log(
                chalk.gray(
                    '🔌 MongoDB connection closed.'
                )
            );
        }

    } catch {}


    process.exit(0);
}


process.once(
    'SIGTERM',
    () => shutdown('SIGTERM')
);

process.once(
    'SIGINT',
    () => shutdown('SIGINT')
);


// ══════════════════════════════════════════════════════════════
// GLOBAL ERROR GUARDS
// ══════════════════════════════════════════════════════════════

process.on(
    'uncaughtException',
    error => {

        console.error(
            chalk.red(
                `⚠️ Uncaught Exception: ${error.message}`
            )
        );
    }
);


process.on(
    'unhandledRejection',
    reason => {

        console.error(
            chalk.red(
                `⚠️ Unhandled Rejection: ${reason?.message || reason}`
            )
        );
    }
);


// ══════════════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════════════

init();
