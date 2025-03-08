let valorDisplay = '';
let primerNumero = null;
let operadorActual = null;
let contadorOperaciones = 0;
let historialOperaciones = [];
let intentosRestantes = 3;
let necesitaVerificacion = false;
const tasasCambio = { '$': 1.2, 'JPY': 130, 'Pesos': 24 };

document.getElementById('pantalla').addEventListener('keydown', e => e.preventDefault());
document.getElementById('pantalla').addEventListener('paste', e => e.preventDefault());

function manejarEstadoBotones(encendido) {
    const botones = document.querySelectorAll('button:not(#botonEncender):not(#botonApagar)');
    botones.forEach(boton => boton.disabled = !encendido);
    document.getElementById('botonApagar').disabled = !encendido;
    document.getElementById('pantalla').disabled = !encendido;
}

function encender() {
    manejarEstadoBotones(true);
    document.getElementById('botonEncender').disabled = true;
}

function apagar() {
    manejarEstadoBotones(false);
    document.getElementById('botonEncender').disabled = false;
    bloquearCalculadora();
}

function agregarNumero(numero) {
    if (valorDisplay.length < 15) {
        valorDisplay += numero;
        actualizarPantalla();
    }
}

function calcular() {
    if (operadorActual && valorDisplay) {
        const segundoNumero = parseFloat(valorDisplay.replace(',', '.'));
        let resultado;
        
        switch(operadorActual) {
            case '+': resultado = primerNumero + segundoNumero; break;
            case '-': resultado = primerNumero - segundoNumero; break;
            case '*': resultado = primerNumero * segundoNumero; break;
            case '/': resultado = segundoNumero !== 0 ? primerNumero / segundoNumero : 'Error';
        }

        if (typeof resultado === 'number' && !isNaN(resultado)) {
            valorDisplay = resultado.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            agregarAlHistorial(`${primerNumero} ${operadorActual} ${segundoNumero} = ${resultado}`);
        } else {
            valorDisplay = 'Error';
        }
        
        actualizarPantalla();
        primerNumero = null;
        operadorActual = null;
    }
}

function agregarAlHistorial(operacion) {
    historialOperaciones.push(operacion);
    actualizarHistorial();
    
    if (!necesitaVerificacion) {
        contadorOperaciones++;
        
        if (contadorOperaciones === 5) {
            necesitaVerificacion = true;
            verificarLimiteOperaciones();
        }
    }
}

function actualizarHistorial() {
    const monedaSeleccionada = document.getElementById('moneda').value;
    const divHistorial = document.getElementById('historial');
    
    divHistorial.innerHTML = historialOperaciones.map(op => {
        const resultado = parseFloat(op.split('=')[1]);
        let conversion = '';
        
        if (monedaSeleccionada !== '€' && !isNaN(resultado)) {
            const valorConvertido = resultado * tasasCambio[monedaSeleccionada];
            const simbolo = monedaSeleccionada === 'JPY' ? '¥' : monedaSeleccionada;
            conversion = `<br>${resultado.toFixed(2)}€ = ${valorConvertido.toFixed(2)}${simbolo}`;
        }
        
        return `<div>${op}${conversion}</div><hr>`;
    }).join('');
}

function verificarLimiteOperaciones() {
    setTimeout(() => {
        const continuar = confirm('¿Desea continuar usando la calculadora?');
        
        if (!continuar) {
            bloquearCalculadora();
            return;
        }

        let codigoValido = false;
        while (intentosRestantes > 0 && !codigoValido) {
            const codigo = prompt(`Código (intentos: ${intentosRestantes}):`);
            
            if (codigo === null) {
                bloquearCalculadora();
                return;
            }
            
            const ultimoResultado = parseFloat(
                historialOperaciones[historialOperaciones.length-1]
                .split('=')[1]
                .trim()
                .replace(/\./g, '')
                .replace(',', '.')
            );

            const codigoNumerico = parseFloat(codigo.replace(',', '.'));
            
            if (codigoNumerico === ultimoResultado) {
                contadorOperaciones = 0;
                necesitaVerificacion = false;
                intentosRestantes = 3;
                codigoValido = true;
                alert('¡Código correcto!');
            } else {
                intentosRestantes--;
                
                if (intentosRestantes <= 0) {
                    alert('¡Sistema bloqueado!');
                    document.getElementById('botonApagar').disabled = true;
                    bloquearCalculadora();
                    document.getElementById('botonEncender').disabled = false;
                    manejarEstadoBotones(false);
                    return;
                }
                
                alert(`Código incorrecto. Intentos restantes: ${intentosRestantes}`);
            }
        }
    }, 50);
}

function bloquearCalculadora() {
    document.querySelectorAll('button:not(#botonEncender)').forEach(boton => {
        boton.disabled = true;
    });
    
    // Resetear estado interno
    valorDisplay = '';
    primerNumero = null;
    operadorActual = null;
    contadorOperaciones = 0;
    historialOperaciones = [];
    intentosRestantes = 3;
    necesitaVerificacion = false;
    
    actualizarPantalla();
    actualizarHistorial();
    
    document.getElementById('botonEncender').disabled = false;
    document.getElementById('botonApagar').disabled = true;
}

function agregarDecimal() {
    if (!valorDisplay.includes(',')) {
        valorDisplay += valorDisplay ? ',' : '0,';
        actualizarPantalla();
    }
}

function borrarUltimo() {
    valorDisplay = valorDisplay.slice(0, -1);
    actualizarPantalla();
}

function borrarTodo() {
    valorDisplay = '';
    primerNumero = null;
    operadorActual = null;
    actualizarPantalla();
}

function agregarOperacion(op) {
    if (valorDisplay) {
        primerNumero = parseFloat(valorDisplay.replace(',', '.'));
        operadorActual = op;
        valorDisplay = '';
        actualizarPantalla();
    }
}

function actualizarPantalla() {
    document.getElementById('pantalla').value = valorDisplay;
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarPantalla();
    manejarEstadoBotones(false);
});