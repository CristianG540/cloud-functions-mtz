import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()
// As an admin, the app has access to read and write all data, regardless of Security Rules
const firestoreDB = admin.firestore()

// Keeps track of the length of the 'products' list in a separate document property.
export const documentWriteListener = functions.firestore
  .document('products/{documentUid}')
  .onWrite( change => {

    const countersRef = firestoreDB.collection('counters')
    const countRef = countersRef.doc('counts')

    let increment:number
    if (!change.before.exists && change.after.exists) { // Si antes no existia (before) y despues si existe (after) entonces el registro es nuevo y aumento uno al contador de productos
      increment = 1
    } else if (change.before.exists && !change.after.exists) { // Si antes existia (before) y despues no existe (after) entonces el registro se elimino y quito uno al contador de productos
      increment = -1
    } else {
      return null
    }

    return firestoreDB.runTransaction(async (t) => {

      const countsSnap = await t.get(countRef)
      const newProdsCount = (countsSnap.data().prods_count || 0 ) + increment
      const transactionRes = await t.set(countRef, {
        prods_count : newProdsCount
      }, { merge: true })

      console.log('Products counter updated.', transactionRes)

    })

  })

// Keeps track of the length of the 'products' list in a separate document property.
export const mtzProdsBogotaWriteListener = functions.firestore
  .document('prods-bogota/{documentUid}')
  .onWrite( change => {

    const countersRef = firestoreDB.collection('counters')
    const countRef = countersRef.doc('counts')

    let increment:number
    if (!change.before.exists && change.after.exists) { // Si antes no existia (before) y despues si existe (after) entonces el registro es nuevo y aumento uno al contador de productos
      increment = 1
    } else if (change.before.exists && !change.after.exists) { // Si antes existia (before) y despues no existe (after) entonces el registro se elimino y quito uno al contador de productos
      increment = -1
    } else {
      return null
    }

    return firestoreDB.runTransaction(async (t) => {

      const countsSnap = await t.get(countRef)
      const newProdsCount = (countsSnap.data().prods_bogota_count || 0 ) + increment
      const transactionRes = await t.set(countRef, {
        prods_bogota_count : newProdsCount
      }, { merge: true })

      console.log('Bogota products counter updated.', transactionRes)

    })

  })

// If the counts document gets deleted, recount the all the counters
exports.recountProds = functions.firestore.document('counters/counts').onDelete(async (snap) => {
  const counterDocRef = snap.ref
  // Productos
  const prodsCollectionRef = firestoreDB.collection('products')
  const prodsCollectionSnap = await prodsCollectionRef.get()
  // Productos bogota
  const mtzProdsBogotaProdsCollectionRef = firestoreDB.collection('prods-bogota')
  const mtzProdsBogotaProdsCollectionSnap = await mtzProdsBogotaProdsCollectionRef.get()

  const setCounterRes = await counterDocRef.set({
    prods_count: prodsCollectionSnap.size,
    prods_bogota_count: mtzProdsBogotaProdsCollectionSnap.size
  })

  console.log('All the counters are been recounted', setCounterRes)

  return true
})
