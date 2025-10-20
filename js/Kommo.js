// Datos iniciales
let plantillas = [
    {
        id: 1,
        nombre: 'Plantilla Bienvenida',
        contenido: 'Hola, bienvenido a nuestro servicio',
        audio: 'bienvenida.mp3',
        audioData: null
    },
    {
        id: 2,
        nombre: 'Plantilla Seguimiento',
        contenido: 'Gracias por tu compra, te contactaremos pronto',
        audio: 'seguimiento.mp3',
        audioData: null
    },
    {
        id: 3,
        nombre: 'Plantilla Recordatorio',
        contenido: 'Recordatorio: tienes una cita pendiente',
        audio: 'Sin audio',
        audioData: null
    }
];

let idCounter = 4;
let paginaActual = 1;
const registrosPorPagina = 10;

// Validar que solo se suban archivos MP3
function validarAudio(input) {
    const archivo = input.files[0];
    if (archivo) {
        const extension = archivo.name.split('.').pop().toLowerCase();
        const tipo = archivo.type;
        
        const extensionesValidas = ['mp3', 'wav', 'ogg'];
        const tiposValidos = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/x-wav'];
        
        if (!extensionesValidas.includes(extension) && !tiposValidos.includes(tipo)) {
            alert('❌ Solo se permiten archivos MP3, WAV u OGG');
            input.value = '';
            return false;
        }
    }
    return true;
}

// Mostrar el formulario
function mostrarFormulario() {
    document.getElementById('formulario').style.display = 'flex';
}

// Cerrar el formulario
function cerrarFormulario() {
    document.getElementById('nombrePlantilla').value = '';
    document.getElementById('contenido').value = '';
    document.getElementById('audio').value = '';
    document.getElementById('formulario').style.display = 'none';
}

// Guardar una nueva plantilla
function guardarPlantilla(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombrePlantilla').value;
    const contenido = document.getElementById('contenido').value;
    const audioFile = document.getElementById('audio').files[0];
    
    let audioData = null;
    let audioNombre = 'Sin audio';
    
    if (audioFile) {
        audioNombre = audioFile.name;
        audioData = URL.createObjectURL(audioFile);
    }
    
    const plantilla = {
        id: idCounter++,
        nombre: nombre,
        contenido: contenido,
        audio: audioNombre,
        audioData: audioData
    };
    
    plantillas.push(plantilla);
    cerrarFormulario();
    
    // Ir a la última página
    paginaActual = Math.ceil(plantillas.length / registrosPorPagina);
    actualizarTabla();
}

// Reproducir audio
function reproducirAudio(id) {
    const plantilla = plantillas.find(p => p.id === id);
    if (plantilla && plantilla.audioData) {
        const audioPlayer = document.getElementById('audioPlayer');
        const modal = document.getElementById('audioModal');
        audioPlayer.src = plantilla.audioData;
        modal.style.display = 'flex';
        audioPlayer.play();
    } else {
        alert('⚠️ Esta plantilla no tiene audio');
    }
}

// Cerrar reproductor de audio
function cerrarAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    const modal = document.getElementById('audioModal');
    audioPlayer.pause();
    audioPlayer.src = '';
    modal.style.display = 'none';
}

// Cerrar audio si hace clic fuera
function cerrarSiClickFueraAudio(event) {
    if (event.target.id === 'audioModal') {
        cerrarAudio();
    }
}

// Pausar el audio
function pausarAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.pause();
}

// Reanudar el audio
function reanudarAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.play();
}

// Detener el audio (pausa y reinicia)
function detenerAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

// Actualizar la tabla con paginación
function actualizarTabla() {
    const tbody = document.getElementById('tablaPlantillas');
    tbody.innerHTML = '';
    
    // Ordenar plantillas por ID descendente (más reciente primero)
    const plantillasOrdenadas = [...plantillas].sort((a, b) => b.id - a.id);
    
    // Calcular índices
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const plantillasPagina = plantillasOrdenadas.slice(inicio, fin);
    
    // Mostrar plantillas de la página actual
    plantillasPagina.forEach(plantilla => {
        const tr = document.createElement('tr');
        
        const audioCell = plantilla.audioData 
            ? `<button class="btn-play" onclick="reproducirAudio(${plantilla.id})">▶ Reproducir</button>`
            : plantilla.audio;
        
        tr.innerHTML = `
            <td>${plantilla.id}</td>
            <td>${plantilla.nombre}</td>
            <td>${plantilla.contenido}</td>
            <td>${audioCell}</td>
            <td>
                <button class="btn-icon" onclick="editarPlantilla(${plantilla.id})" title="Editar">✏️</button>
                <button class="btn-icon" onclick="eliminarPlantilla(${plantilla.id})" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    actualizarPaginacion();
}

// Actualizar controles de paginación
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(plantillas.length / registrosPorPagina);
    
    document.getElementById('infoPagina').textContent = `Página ${paginaActual} de ${totalPaginas || 1}`;
    document.getElementById('btnAnterior').disabled = paginaActual === 1;
    document.getElementById('btnSiguiente').disabled = paginaActual === totalPaginas || totalPaginas === 0;
}

// Cambiar de página
function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(plantillas.length / registrosPorPagina);
    paginaActual += direccion;
    
    if (paginaActual < 1) paginaActual = 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    
    actualizarTabla();
}

// Editar una plantilla existente
function editarPlantilla(id) {
    const plantilla = plantillas.find(p => p.id === id);
    if (plantilla) {
        document.getElementById('nombrePlantilla').value = plantilla.nombre;
        document.getElementById('contenido').value = plantilla.contenido;
        mostrarFormulario();
    }
}

// Eliminar una plantilla
function eliminarPlantilla(id) {
    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
        plantillas = plantillas.filter(p => p.id !== id);
        
        // Ajustar página si es necesario
        const totalPaginas = Math.ceil(plantillas.length / registrosPorPagina);
        if (paginaActual > totalPaginas && paginaActual > 1) {
            paginaActual--;
        }
        
        actualizarTabla();
    }
}

// Cargar plantillas al iniciar la página
actualizarTabla();

// Buscar plantillas
function buscarPlantilla() {
    const busqueda = document.getElementById('buscarPlantilla').value.toLowerCase();
    const tbody = document.getElementById('tablaPlantillas');
    const filas = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const nombre = fila.cells[1] ? fila.cells[1].textContent.toLowerCase() : '';
        const contenido = fila.cells[2] ? fila.cells[2].textContent.toLowerCase() : '';
        
        if (nombre.includes(busqueda) || contenido.includes(busqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    }
}