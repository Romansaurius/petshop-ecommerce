@echo off
echo ========================================
echo  IMPORTANDO BASE DE DATOS E-COMMERCE
echo ========================================
echo.

echo Conectando a MySQL...
C:\xampp\mysql\bin\mysql.exe -u root -e "SOURCE database/complete_schema.sql"

echo.
echo Importando datos de ejemplo...
C:\xampp\mysql\bin\mysql.exe -u root ecommerce_mascotas -e "SOURCE database/datos_ejemplo.sql"

echo.
echo ========================================
echo  BASE DE DATOS IMPORTADA CORRECTAMENTE
echo ========================================
echo.
echo Presiona cualquier tecla para continuar...
pause > nul