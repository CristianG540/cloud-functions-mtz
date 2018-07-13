"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// As an admin, the app has access to read and write all data, regardless of Security Rules
const firestoreDB = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!")
// })
// Keeps track of the length of the 'products' list in a separate document property.
exports.documentWriteListener = functions.firestore
    .document('products/{documentUid}')
    .onWrite(change => {
    const countersRef = firestoreDB.collection('counters');
    const countRef = countersRef.doc('counts');
    let increment;
    if (!change.before.exists && change.after.exists) { // Si antes no existia (before) y despues si existe (after) entonces el registro es nuevo y aumento uno al contador de productos
        increment = 1;
    }
    else if (change.before.exists && !change.after.exists) { // Si antes existia (before) y despues no existe (after) entonces el registro se elimino y quito uno al contador de productos
        increment = -1;
    }
    else {
        return null;
    }
    return firestoreDB.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
        const countsSnap = yield t.get(countRef);
        const newProdsCount = (countsSnap.data().prods_count || 0) + increment;
        const transactionRes = yield t.set(countRef, {
            prods_count: newProdsCount
        }, { merge: true });
        console.log('Products counter updated.', transactionRes);
    }));
});
// If the counts document gets deleted, recount the all the counters
exports.recountProds = functions.firestore.document('counters/counts').onDelete((snap) => __awaiter(this, void 0, void 0, function* () {
    const counterDocRef = snap.ref;
    const prodsCollectionRef = firestoreDB.collection('products');
    const prodsCollectionSnap = yield prodsCollectionRef.get();
    const setCounterRes = yield counterDocRef.set({
        prods_count: prodsCollectionSnap.size
    });
    console.log('All the counters are been recounted', setCounterRes);
    return true;
}));
//# sourceMappingURL=index.js.map