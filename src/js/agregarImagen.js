import { Dropzone } from 'dropzone';
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const dropzone = new Dropzone('#imagen', {
    dictDefaultMessage: 'Sube tus imagenes aqui',
    acceptedFiles: '.png,.jpg,.jpeg',
    maxFilesize: 5, // Tamaño máximo de archivo en MB
    maxFiles: 1, // Número máximo de archivos permitidos
    parallelUploads: 1, // Subir un archivo a la vez
    autoProcessQueue: false, // No procesar automáticamente la cola de archivos
    addRemoveLinks: true, // Añadir enlace para eliminar archivos
    dictRemoveFile: 'Borrar Archivo',
    dictMaxFilesExceeded: 'El límite es 1 archivo',
    headers: {
        'CSRF-TOKEN': token
    },
    paramName: 'imagen',
    init: function(){
        const dropzone = this
        const btnPublicar = document.querySelector('#publicar')

        btnPublicar.addEventListener('click', function(){
            dropzone.processQueue()
        })

        dropzone.on('queuecomplete', function(){
            if(dropzone.getActiveFiles().length == 0){
                window.location.href = '/mis-propiedades'
            }
        })
    }
});