USE ecommerce_mascotas;

INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, destacado, stock, especificaciones) VALUES
('Comedero Automático Wi-Fi Premium', 'Comedero inteligente con conectividad Wi-Fi, programación por horarios y control remoto desde app móvil', 89999.00, 'comederos', '/images/comedero-wifi.jpg', TRUE, 15, '{"capacidad": "2.5L", "conectividad": "Wi-Fi 2.4GHz", "alimentacion": "AC + Batería", "material": "Acero inoxidable"}'),

('Comedero Automático Wi-Fi Básico', 'Comedero automático con Wi-Fi y programación básica', 59999.00, 'comederos', '/images/comedero-wifi-basico.jpg', TRUE, 25, '{"capacidad": "1.8L", "conectividad": "Wi-Fi 2.4GHz", "alimentacion": "AC", "material": "Plástico ABS"}'),

('Juguete Interactivo para Gatos', 'Juguete con sensor de movimiento y luces LED', 15999.00, 'juguetes', '/images/juguete-gato.jpg', FALSE, 50, '{"material": "Plástico seguro", "bateria": "AAA x3", "edad": "Todas las edades"}'),

('Cama Ortopédica para Perros', 'Cama con espuma viscoelástica para el descanso óptimo', 45999.00, 'camas', '/images/cama-ortopedica.jpg', FALSE, 20, '{"tamaño": "Grande", "material": "Espuma viscoelástica", "funda": "Lavable"}'),

('Collar GPS Inteligente', 'Collar con GPS y monitor de actividad', 35999.00, 'collares', '/images/collar-gps.jpg', TRUE, 30, '{"bateria": "7 días", "resistencia": "IPX7", "conectividad": "4G + GPS"}'),

('Rascador Torre Gigante', 'Torre rascador de 180cm con múltiples niveles', 89999.00, 'rascadores', '/images/rascador-torre.jpg', FALSE, 10, '{"altura": "180cm", "material": "Sisal natural", "base": "60x60cm"}'),

('Juguete Dispensador de Premios', 'Pelota interactiva que dispensa snacks', 12999.00, 'juguetes', '/images/dispensador-premios.jpg', FALSE, 40, '{"material": "Caucho natural", "capacidad": "100g", "dificultad": "Ajustable"}'),

('Cama Térmica Autorregulable', 'Cama que mantiene temperatura corporal sin electricidad', 32999.00, 'camas', '/images/cama-termica.jpg', FALSE, 25, '{"tamaño": "Mediano", "material": "Gel térmico", "lavable": "Sí"}}');