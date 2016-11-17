var myDropzone = new Dropzone("#my-awesome-dropzone", { url: "/upload"});

myDropzone.on('success', function (e, data) {
    document.write(data);
    document.close();
});