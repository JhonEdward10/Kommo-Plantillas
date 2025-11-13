// URL base de los endpoints
const API_BASE = 'https://plantillas.maplascali.net/back';

// Variables globales
let plantillas = [];
let idCounter = 1;
let paginaActual = 1;
const registrosPorPagina = 10;
let plantillaEditandoId = null;

// Cargar plantillas desde el servidor al iniciar
async function cargarPlantillas() {
    try {
        const response = await fetch(`${API_BASE}/list_plantillas.php`);
        const data = await response.json();
        
        if (data.status === 'ok' && data.data) {
            // Mapear los datos al formato que necesitamos
            plantillas = data.data.map(p => ({
                id: parseInt(p.id),
                nombre: p.nombre,
                contenido: p.contenido,
                audio_url: p.audio ? `https://plantillas.maplascali.net/back/${p.audio}` : null,
                fecha: p.fecha
            }));
            actualizarTabla();
        } else {
            console.error('Error al cargar plantillas:', data.message || 'Error desconocido');
            alert('No se pudieron cargar las plantillas');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error al cargar las plantillas. Verifica tu conexión.');
    }
}

// Validar que solo se suban archivos MP3, WAV u OGG
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
    plantillaEditandoId = null;
    document.getElementById('plantillaId').value = '';
    document.getElementById('nombrePlantilla').value = '';
    document.getElementById('contenido').value = '';
    document.getElementById('audio').value = '';
    // document.getElementById('audio').required = true;
    document.getElementById('formulario').style.display = 'flex';
}

// Cerrar el formulario
function cerrarFormulario() {
    plantillaEditandoId = null;
    document.getElementById('plantillaId').value = '';
    document.getElementById('nombrePlantilla').value = '';
    document.getElementById('contenido').value = '';
    document.getElementById('audio').value = '';
    document.getElementById('formulario').style.display = 'none';
}

// Cerrar formulario si hace clic fuera
function cerrarSiClickFuera(event) {
    if (event.target.id === 'formulario') {
        cerrarFormulario();
    }
}

// Guardar o actualizar una plantilla
async function guardarPlantilla(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const nombre = document.getElementById('nombrePlantilla').value;
    const contenido = document.getElementById('contenido').value;
    const audioFile = document.getElementById('audio').files[0];
    
    formData.append('nombre', nombre);
    formData.append('contenido', contenido);
    
    let url = `${API_BASE}/create_plantillas.php`;
    
    // Si estamos editando
    if (plantillaEditandoId) {
        url = `${API_BASE}/edit_plantillas.php`;
        formData.append('id', plantillaEditandoId);
    }
    
    // Solo agregar audio si se seleccionó uno
    if (audioFile) {
        formData.append('audio', audioFile);
    }// else if (!plantillaEditandoId) {
    //     alert('⚠️ Debes seleccionar un archivo de audio');
    //     return;
    // }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Cambiar aquí: verificar data.status en lugar de data.success
        if (data.status === 'ok') {
            alert(plantillaEditandoId ? '✅ Plantilla actualizada correctamente' : '✅ Plantilla creada correctamente');
            cerrarFormulario();
            await cargarPlantillas();
            paginaActual = 1;
        } else {
            alert('❌ Error: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar la plantilla');
    }
}

// Reproducir audio
function reproducirAudio(id) {
    const plantilla = plantillas.find(p => p.id === id);
    if (plantilla && plantilla.audio_url) {
        const audioPlayer = document.getElementById('audioPlayer');
        const modal = document.getElementById('audioModal');
        audioPlayer.src = plantilla.audio_url;
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
    audioPlayer.currentTime = 0;
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
        
        const audioCell = plantilla.audio_url 
            ? `<button class="btn-play" onclick="reproducirAudio(${plantilla.id})">▶ Reproducir</button>`
            : 'Sin audio';
        
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
        plantillaEditandoId = id;
        document.getElementById('plantillaId').value = id;
        document.getElementById('nombrePlantilla').value = plantilla.nombre;
        document.getElementById('contenido').value = plantilla.contenido;
        //document.getElementById('audio').required = false; // Audio opcional al editar
        document.getElementById('formulario').style.display = 'flex';
    }
}

// Eliminar una plantilla
// Eliminar una plantilla
async function eliminarPlantilla(id) {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch(`${API_BASE}/delete_plantillas.php`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Cambiar aquí: verificar data.status en lugar de data.success
        if (data.status === 'ok') {
            alert('✅ Plantilla eliminada correctamente');
            await cargarPlantillas();
            
            // Ajustar página si es necesario
            const totalPaginas = Math.ceil(plantillas.length / registrosPorPagina);
            if (paginaActual > totalPaginas && paginaActual > 1) {
                paginaActual--;
            }
        } else {
            alert('❌ Error: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar la plantilla');
    }
}

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

// Cargar plantillas al iniciar la página
window.addEventListener('DOMContentLoaded', () => {
    cargarPlantillas();
});