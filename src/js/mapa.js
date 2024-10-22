(function() {
    const lat = document.querySelector('#lat').value || 20.6749019;
    const lng = document.querySelector('#lng').value || -103.355545;
    const mapa = L.map('mapa').setView([lat, lng ], 12);

    let marker;

    //Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //El pin
    marker = new L.marker([lat, lng], { //Extraer latitud y longitud del mapa
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    //Detectas el movimiento del pin detectando la longitud y latitud

    marker.on('moveend', function(e){
        marker = e.target
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        //Obtener la información de las calles
        geocodeService.reverse().latlng(posicion, 12).run(function(error, resultado){
            console.log(resultado);

            marker.bindPopup(resultado.address.LongLabel)

            //Llenar los campos 
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })

    })

})()