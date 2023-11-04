var express = require('express');
var router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const { render } = require('ejs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();


router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Creando la constante de la base de datos
const db = new sqlite3.Database('database.db');

// Ejecutar una consulta SQL para crear la tabla "categorias"
db.run(`CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL
)`, (err) => {
  if (err) {
    console.error('Error al crear la tabla "categorias":', err.message);
  } else {
    console.log('Tabla "categorias" creada correctamente.');
  }
});

// Ejecutar una consulta SQL para agregar una categoría
// db.run(`INSERT INTO categorias (nombre) VALUES ('Motos')`, (err) => {
//   if (err) {
//     console.error('Error al agregar la categoría', err.message);
//   } else {
//     console.log('Categoría agregada correctamente');
//   }
// });

// Ejecutar una consulta SQL para crear la tabla "productos"
db.run(`CREATE TABLE productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR NOT NULL,
  marca VARCHAR NOT NULL,
  estado VARCHAR NOT NULL,
  codigo INTEGER NOT NULL,
  precio REAL NOT NULL,
  descripcion TEXT,
  categoria_id INTEGER
)`, (err) => {
  if (err) {
    console.error('Error al crear la tabla "productos":', err.message);
  } else {
    console.log('Tabla "productos" creada correctamente.');
  }
});

// Ejecutar una consulta SQL para agregar un producto
// db.run(`INSERT INTO productos (nombre, marca, estado, codigo, precio, descripcion, categoria_id) VALUES ('Producto 2', 'Ducati', 'Usado', 158487, 499.99, 'Descripcion 2', 2)`, (err) => {
//   if (err) {
//     console.error('Error al agregar el producto', err.message);
//   } else {
//     console.log('Producto agregado correctamente');
//   }
// });

// Ejecutar una consulta SQL para crear la tabla "imagenes"
db.run(`CREATE TABLE imagenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER,
  url VARCHAR,
  destacado BOOLEAN
)`, (err) => {
  if (err) {
    console.error('Error al crear la tabla "imagenes":', err.message);
  } else {
    console.log('Tabla "imagenes" creada correctamente.');
  }
});

// Ejecutar una consulta SQL para agregar una imagen
// db.run(`INSERT INTO imagenes (producto_id, url, destacado) VALUES (1, 'https://www.autobild.es/sites/navi.axelspringer.es/public/media/image/2022/11/mejores-motos-deportivas-2022-2882775.jpg', true)`, (err) => {
//   if (err) {
//     console.error('Error al agregar la imagen', err.message);
//   } else {
//     console.log('Imagen agregada correctamente');
//   }
// });


// Configuración del middleware de sesión
router.use(session({
  secret: 'secreto', // Cambia esto por una cadena de texto segura y única
  resave: false,
  saveUninitialized: false
}));

//Colsultar datos de las tablas de la base de datos

// Ruta para mostrar la vista principal
router.get('/', (req, res) => {
  // Obtener los datos de los productos desde la base de datos
  db.all('SELECT p.nombre AS nombre, p.marca, p.estado, p.descripcion, p.precio, i.url AS imagen, c.nombre AS categoria ' +
    'FROM productos p ' +
    'LEFT JOIN imagenes i ON p.id = i.producto_id ' +
    'LEFT JOIN categorias c ON p.categoria_id = c.id', (err, rows) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      return;
    }
    
    // Los resultados de la consulta estarán en el arreglo 'rows'
    let productos = rows;
    
    // Renderizar la vista EJS y pasar los datos de los productos
    res.render('index', { productos });
  });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

  //Cerrar Sesión
router.get('/logout', (req, res) => {
  // Destruir la sesión y redirigir al inicio de sesión
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

// Ruta para procesar el inicio de sesión del administrador
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  // Verificar si el nombre de usuario y la contraseña coinciden con las variables de entorno
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Establecer la sesión como autenticada
    req.session.authenticated = true;
    res.redirect('/add-category');
  } else {
    res.redirect('/login');
  }
});

// Ruta para mostrar el panel de administrador
router.get('/add-category', (req, res, next) => {

  db.all('SELECT p.nombre AS nombre, p.id AS id, p.estado, p.descripcion, p.precio, i.url AS imagen, c.nombre AS nombre_categoria ' +
  'FROM productos p ' +
  'LEFT JOIN imagenes i ON p.id = i.producto_id ' +
  'LEFT JOIN categorias c ON p.categoria_id = c.id', (err, rows) => {
  if (err) {
    console.error('Error al obtener los productos:', err);
    return;
  }
  
  // Los resultados de la consulta estarán en el arreglo 'rows'
  let productos = rows;

    // Verificar si el usuario ha iniciado sesión
    if (req.session.authenticated) {
      console.log(productos)
      res.render('add-category', { productos,  message: ''  });
    } else {
      res.redirect('/login');
    }
  });
});

// Ruta para mostrar el panel de administrador
router.get('/add-image', (req, res, next) => {

  db.all('SELECT p.nombre AS nombre, p.id AS id, p.estado, p.descripcion, p.precio, i.url AS imagen, c.nombre AS nombre_categoria ' +
  'FROM productos p ' +
  'LEFT JOIN imagenes i ON p.id = i.producto_id ' +
  'LEFT JOIN categorias c ON p.categoria_id = c.id', (err, rows) => {
  if (err) {
    console.error('Error al obtener los productos:', err);
    return;
  }
  
  // Los resultados de la consulta estarán en el arreglo 'rows'
  let productos = rows;

    // Verificar si el usuario ha iniciado sesión
    if (req.session.authenticated) {
      console.log(productos)
      res.render('add-image', { productos,  message: ''  });
    } else {
      res.redirect('/login');
    }
  });
});

// Ruta para mostrar el panel de administrador
router.get('/add-product', (req, res, next) => {
  

  db.all('SELECT c.id, c.nombre ' +
  'FROM categorias c;', (err, rows) => {
  if (err) {
    console.error('Error al obtener los productos:', err);
    return;
  }
  
  // Los resultados de la consulta estarán en el arreglo 'rows'
  let productos = rows;

    // Verificar si el usuario ha iniciado sesión
    if (req.session.authenticated) {
      console.log(productos)
      res.render('add-product', { productos,  message: ''  });
    } else {
      res.redirect('/login');
    }
  });
});

// Ruta para mostrar el panel de administrador
router.get('/list', (req, res, next) => {

  db.all('SELECT p.nombre AS nombre, p.id AS id, p.estado, p.marca, p.codigo, p.descripcion, p.precio, i.url AS imagen, c.nombre AS categoria ' +
  'FROM productos p ' +
  'LEFT JOIN imagenes i ON p.id = i.producto_id ' +
  'LEFT JOIN categorias c ON p.categoria_id = c.id', (err, rows) => {
  if (err) {
    console.error('Error al obtener los productos:', err);
    return;
  }
  
  // Los resultados de la consulta estarán en el arreglo 'rows'
  let productos = rows;

    // Verificar si el usuario ha iniciado sesión
    if (req.session.authenticated) {
      console.log(productos)
      res.render('list', { productos,  message: '' });
    } else {
      res.redirect('/login');
    }
  });
});

// Ruta para procesar el formulario y añadir la categoría a la base de datos
router.post('/add-category', (req, res) => {
  const categoryName = req.body['category-name'];

  // Insertar la categoría en la base de datos
  db.run('INSERT INTO categorias (nombre) VALUES (?)', [categoryName], (err) => {
    if (err) {
      console.error('Error al añadir la categoría:', err);
      res.render('admin', { message: 'Error al agregar la categoría' });
      return;
    }
    res.render('add-category', { message: 'Categoría agregada correctamente' });
  });
});

// Ruta para procesar el formulario y añadir Productos
router.post('/add-product', (req, res) => {
  const nombre = req.body['product-name']
  const marca = req.body['product-marca']
  const estado = req.body['product-estado']
  const codigo = parseInt(req.body['product-codigo'])
  const precio = parseFloat(req.body['product-price'])
  const descripcion = req.body['product-description']
  const categoria_id = parseInt(req.body['product-category'])

  productos = [{
    nombre: 'Producto 3',
    id: 4,
    estado: 'Usado',
    descripcion: 'Descripcion 2',
    precio: 499.99
  }]

  // Insertar el Producto en la base de datos
  db.run('INSERT INTO productos (nombre, marca, estado, codigo, precio, descripcion, categoria_id) VALUES (?,?,?,?,?,?,?)', [nombre, marca, estado, codigo, precio, descripcion, categoria_id], (err) => {
    if (err) {
      console.error('Error al añadir la categoría:', err);
      res.render('add-product', { message: 'Error al agregar el producto' });
      return;
    }
    res.render('add-product', {productos, message: 'Producto agregado correctamente' });
  });
});
// Ruta para procesar el formulario y añadir Imagenes
router.post('/add-image', (req, res) => {
  const productoId = req.body['product-id']
  const url = req.body['image-url']
  const destacado = req.body['is-highlighted']
  let productos = [  {
    nombre: 'Producto1',
    id: 1,
    estado: 'Nuevo',
    descripcion: 'asdadsad',
    precio: 99,
    imagen: 'https://motos-b60.kxcdn.com/sites/default/files/ducati_diavel_v4-2023.jpg',
    nombre_categoria: 'Categoría 1'
  }]
  // Insertar la imagen en la base de datos
  db.run('INSERT INTO imagenes (producto_id, url, destacado) VALUES (?, ?, ?)', [productoId, url, destacado], (err) => {
    if (err) {
      console.error('Error al añadir la categoría:', err);
      res.render('add-image', {productos, message: 'Error al agregar la imagen' });
      return;
    }
    res.render('add-image', {productos, message: 'Imagen agregada correctamente' });
  });
});

router.get('/eliminar-producto/:id', (req, res) => {
  const id = req.params.id;
  // Aquí puedes hacer lo que necesites con el ID del producto
  // Por ejemplo, buscar el producto en la base de datos y devolverlo como respuesta
  db.run('DELETE FROM productos WHERE id = ?', id, function (error) {
    if (error) {
      console.error('Error al eliminar el producto:', error.message);
    } else if (this.changes > 0) {
      console.log(`Producto con ID ${id} eliminado.`);
      res.redirect('/list')
    } else {
      console.log(`Producto con ID ${id} no encontrado.`);
    }
  });
});

router.get('/actualizar-producto/:id', (req, res) => {

  const id = parseInt(req.params.id);

  db.all('SELECT p.nombre AS nombre, p.id AS id, p.estado, p.marca, p.codigo, p.descripcion, p.precio, i.url AS imagen, c.nombre AS categoria ' +
  'FROM productos p ' +
  'LEFT JOIN imagenes i ON p.id = i.producto_id ' +
  'LEFT JOIN categorias c ON p.categoria_id = c.id '+
  'WHERE p.id = ?', id, (err, rows) => {
  if (err) {
    console.error('Error al obtener los productos:', err);
    return;
  }
  
  // Los resultados de la consulta estarán en el arreglo 'rows'
  let productos = rows;

    // Verificar si el usuario ha iniciado sesión
    if (req.session.authenticated) {
      console.log(productos)
      res.render('actualizar-producto', { productos,  message: '' });
    } else {
      res.redirect('/login');
    }
  });
});

router.post('/actualizar-producto/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const nombre = req.body['product-name']
  const marca = req.body['product-marca']
  const estado = req.body['product-estado']
  const codigo = parseInt(req.body['product-codigo'])
  const precio = parseFloat(req.body['product-price'])
  const descripcion = req.body['product-description']
  const categoria_id = parseInt(req.body['product-category'])

  // Ejecuta la consulta para actualizar el producto
  const sql = 'UPDATE productos SET nombre = ?, estado = ?, marca = ?, codigo = ?, descripcion = ?, precio = ?, categoria_id = ? WHERE id = ?';
  db.run(sql, [nombre, estado, marca, codigo, descripcion, precio, categoria_id, id], function (error) {
    if (error) {
      console.error('Error al actualizar el producto:', error.message);
      res.redirect('/error'); // Redirecciona a una página de error, si corresponde
    } else if (this.changes > 0) {
      console.log(`Producto con ID ${id} actualizado.`);
      res.redirect('/list'); // Redirecciona a la página de productos actualizados
    } else {
      console.log(`Producto con ID ${id} no encontrado.`);
      res.redirect('/list'); // Redirecciona a la página de productos sin cambios
    }
  });
});


// Ruta para mostrar el panel de administrador
router.get('/category-list', (req, res, next) => {

  db.all('SELECT c.id, c.nombre ' +
  'FROM categorias c;'
, (err, rows) => {
  if (err) {
    console.error('Error al obtener los productos:', err);
    return;
  }
  
  // Los resultados de la consulta estarán en el arreglo 'rows'
  let productos = rows;

    // Verificar si el usuario ha iniciado sesión
    if (req.session.authenticated) {
      console.log(productos)
      res.render('category-list', { productos,  message: '' });
    } else {
      res.redirect('/login');
    }
  });
});

router.get('/actualizar-categoria/:id', (req, res) => {

  const id = parseInt(req.params.id);

  db.all('SELECT c.id, c.nombre ' +
  'FROM categorias c '+
  'WHERE c.id = ?', id, (err, rows) => {
  if (err) {
    console.error('Error al obtener los productos:', err);
    return;
  }
  
  // Los resultados de la consulta estarán en el arreglo 'rows'
  let productos = rows;
    // Verificar si el usuario ha iniciado sesión
    if (req.session.authenticated) {
      console.log(productos)
      res.render('actualizar-categoria', { productos,  message: '' });
    } else {
      res.redirect('/login');
    }
  });
});

router.post('/actualizar-categoria/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const nombre = req.body['category-name']
  console.log(nombre);
  console.log(id);

  // Ejecuta la consulta para actualizar el producto
  const sql = 'UPDATE categorias SET nombre = ? WHERE id = ?';
  db.run(sql, [nombre, id], function (error) {
    if (error) {
      console.error('Error al actualizar la categoría:', error.message);
      res.redirect('/category-list'); // Redirecciona a una página de error, si corresponde
    } else if (this.changes > 0) {
      console.log(`Categoría con ID ${id} actualizado.`);
      res.redirect('/category-list'); // Redirecciona a la página de productos actualizados
    } else {
      console.log(`Categoría con ID ${id} no encontrado.`);
      res.redirect('/category-list'); // Redirecciona a la página de productos sin cambios
    }
  });
});

router.get('/eliminar-categoria/:id', (req, res) => {
  const id = req.params.id;
  // Aquí puedes hacer lo que necesites con el ID del producto
  // Por ejemplo, buscar el producto en la base de datos y devolverlo como respuesta
  db.run('DELETE FROM categorias WHERE id = ?', id, function (error) {
    if (error) {
      console.error('Error al eliminar la categoria:', error.message);
    } else if (this.changes > 0) {
      console.log(`Categoría con ID ${id} eliminado.`);
      res.redirect('/category-list')
    } else {
      console.log(`Categoría con ID ${id} no encontrado.`);
      res.redirect('/category-list')
    }
  });
});

module.exports = router;
