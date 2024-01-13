import mongoose from 'mongoose'
import Cart from '../dao/mongo/carts.mongo.js'
import Assert from 'assert'
import Chai from 'chai'
import Supertest from 'supertest'
import config from '../config/config.js' 

mongoose.connect(config.mongo_url);

const assert = Assert.strict
const expect = Chai.expect
const requester = Supertest("http://localhost:8080")

describe('Test para Cart Mocha + Chai + SuperTest', () => {
    before(function () {
        this.cartsDao = new Cart()
    })
    it("Obtener los carritos de la DB", async function () {
        this.timeout(5000)
        try
        {
            const result = await this.cartsDao.get()
            assert.strictEqual(Array.isArray(result), true) // usando Mocha
            expect(Array.isArray(result)).to.be.equals(true) // usando Chai
        }
        catch(error)
        {
            console.error("Falló el test: ", error)
            assert.fail("Testeo get de carritos fallido")
        }
    })
    it("Agregar un carrito en la DB", async function () {
        let mockCart = {
            products: [
                {
                    productId: '65a0984c04cf800b5630ca3e',
                    quantity: 100
                }
            ]
        }
        const result = await this.cartsDao.addCart(mockCart)
        assert.ok(result._id) // para Mocha
        expect(result).to.have.property('_id') // para Chai
    })
    it("Obtener un carrito por el id desde la DB", async function () {
        this.timeout(5000)
        try
        {
            let idCart = '65a09e83f137a6012c8712ca'
            const result = await this.cartsDao.getCart(idCart)
            assert.strictEqual(result.hasOwnProperty("cart"), true); // Mocha
            expect(result.hasOwnProperty("cart")).to.be.equals(true); // Chai
        }
        catch(error)
        {
            console.error("Error durante el test: ", error)
            assert.fail("Test get producto con error")
        }
    })
    it("Debería obtener si hay suficiente stock y resta el stock al producto", async function () {
        try 
        {
            let products = [
                {
                    name: "prodtest",
                    description: 'Producto test',
                    stock: 2
                }
            ];
            const result = await this.cartsDao.getStock({ productos: products });
            expect(result[products[0].description].status).to.equal('Suficiente');
        } catch (error) {
            console.error("Error durante el test: ", error);
            assert.fail("Test getStock con error");
        }
    });
    it("Debería devolver el precio total de productos añadidos", async function () {
        try 
        {
            let products = [
                {
                    description: 'Producto 1',
                    price: 10000,
                    stock: 2
                },
                {
                    description: 'Producto 2',
                    price: 2000,
                    stock: 5
                },

            ];
            const result = await this.cartsDao.getAmount({ productos: products });
            // Verifica que el resultado sea un número
            expect(result).to.be.a('number'); //con Chai
            expect(result).to.equal(30000); //con Chai
            assert.strictEqual(typeof result, 'number');//con Mocha
        } catch (error) {
            console.error("Error durante el test: ", error);
            assert.fail("Test getStock con error");
        }
    });

    //CON 2 TERMINALES
    it("Endpoint GET /api/carts debe devolver todos los carritos", async function() {
        const response = await requester.get('/api/carts')
        // Verifica el código de estado HTTP
        assert.strictEqual(response.status, 200);
        // Verifica el tipo de contenido de la respuesta
        expect(response.type).to.equal('application/json');
        // Verifica que la respuesta tenga una propiedad 'status' con valor 'success'
        expect(response.body).to.have.property('status', 'success');
    })
    it("El endpoint POST /api/carts debe crear un carrito", async function() {
        let mockCart = {
            products: [
                {
                    productId: '65a0984c04cf800b5630ca3e',
                    quantity: 5
                }
            ]
        }
        
        const response = await requester.post('/api/carts').send(mockCart)
        // Verifica el código de estado HTTP
        assert.strictEqual(response.status, 200);
        // Verifica el tipo de contenido de la respuesta
        expect(response.ok).to.equal(true);
        // Verifica que la respuesta tenga una propiedad 'status' con valor 'success'
        expect(response.body).to.have.property('status', 'success');
    })
    after(function(done) {
        this.timeout(5000);
        console.log("Test de Carritos finalizado");
        done();
    });
})