(function ($) {
    'use strict';
    var plupload_gallery, plupload_attachment = null;

    if (document.getElementById('map') && listing_variables.map_service == 'google-map') {
        var geocoder = new google.maps.Geocoder();
    }

    if (document.getElementById('map') && listing_variables.map_service == 'map-box') {
        var geoData = {
            "type": "FeatureCollection",
            "features": []
        };
        mapboxgl.accessToken = listing_variables.api_key_map_box ? listing_variables.api_key_map_box : '';
    }

    var handleSaveListingAjax = function () {
        $('.button-save-listing').click(function (event) {
            event.preventDefault();
            var form = $('#submit_listing_form');
            var formData = form.serialize();
            if (form.valid()) {
                $.ajax({
                    type: 'POST',
                    url: listing_variables.ajax_url,
                    data: formData + '&action=save_listing&nonce=' + listing_variables.save_listing_nonce,
                    beforeSend: function () {
                        form.find('.tfcl_message').empty().append('<i class="fa fa-spinner fa-spin"></i>');
                    },
                    success: function (response) {
                        // Handle the registration success response
                        if (response.status) {
                            window.location.href = response.redirect_url + '?new_listing_id=' + response.listing_id + '&submit_mode=' + response.submit_mode;
                        } else {
                            form.find('.tfcl_message').empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
                        }
                    },
                    error: function (xhr, status, error) {
                        // Handle the registration error response
                        console.log(error);
                    }
                });
                form.find('.tfcl_message').empty();
            }
            else {
                form.find('.tfcl_message').empty().append('<div class="tfcl-message alert alert-danger" role="alert"><span class="error text-danger"><i class="fa fa-times-circle"></i> ' + listing_variables.form_invalid_message + '</span></div>');
            }
            return false;
        })
    }

    var checkFieldRequired = function (field_required) {
        return (field_required == true);
    }

    var validateSaveListingForm = function () {
        var formParent = $(".tfcl-listing-form");
        var listing_title = listing_variables.required_listing_fields.listing_title,
            make = listing_variables.required_listing_fields.make,
            model = listing_variables.required_listing_fields.model,
            transmission = listing_variables.required_listing_fields.transmission,
            body = listing_variables.required_listing_fields.body,
            condition = listing_variables.required_listing_fields.condition,
            drive_type = listing_variables.required_listing_fields.drive_type,
            cylinders = listing_variables.required_listing_fields.cylinders,
            fuel_type = listing_variables.required_listing_fields.fuel_type,
            car_color = listing_variables.required_listing_fields.car_color,
            year = listing_variables.required_listing_fields.year,
            stock_number = listing_variables.required_listing_fields.stock_number,
            vin_number = listing_variables.required_listing_fields.vin_number,
            mileage = listing_variables.required_listing_fields.mileage,
            engine_size = listing_variables.required_listing_fields.engine_size,
            door = listing_variables.required_listing_fields.door,
            seat = listing_variables.required_listing_fields.seat,
            city_mpg = listing_variables.required_listing_fields.city_mpg,
            highway_mpg = listing_variables.required_listing_fields.highway_mpg,
            listing_feature = listing_variables.required_listing_fields.listing_feature,

            regular_price = listing_variables.required_listing_fields.regular_price,
            sale_price = listing_variables.required_listing_fields.sale_price;

        formParent.validate({
            ignore: ":hidden", // any children of hidden desc are ignored
            errorElement: "div", // wrap error elements in span not label
            invalidHandler: function (event, validator) { // add aria-invalid to el with error
                $.each(validator.errorList, function (idx, item) {
                    if (idx === 0) {
                        $(item.element).focus(); // send focus to first el with error
                    }
                    $(item.element).attr("aria-invalid", true); // add invalid aria
                    $(item.element).addClass('is-invalid');
                    if ($("[name='features[]']:checked").length == 0) {
                        $(item.element).closest('.listing-feature').addClass('is-invalid');
                    } else {
                        $(item.element).closest('.listing-feature').removeClass('is-invalid');
                    }
                })

            },
            highlight: function (element, errorClass, validClass) {
                var elem = $(element);
                if (elem.hasClass("select2-hidden-accessible")) {
                    elem.parent().find('.select2-container').addClass(errorClass).removeClass(validClass);
                } else {
                    elem.addClass(errorClass).removeClass(validClass);
                    elem.addClass('is-invalid').removeClass('is-valid');
                }
                if ($("[name='features[]']:checked").length == 0) {
                    $(elem).closest('.listing-feature').addClass('is-invalid');
                }
            },
            unhighlight: function (element, errorClass, validClass) {
                var elem = $(element);
                if (elem.hasClass("select2-hidden-accessible")) {
                    elem.parent().find('.select2-container').removeClass(errorClass).addClass(validClass);
                } else {
                    elem.removeClass(errorClass).addClass(validClass);
                    elem.removeClass('is-invalid').addClass('is-valid');
                }
                if ($("[name='features[]']:checked").length != 0) {
                    elem.closest('.listing-feature').removeClass('is-invalid');
                }

            },
            rules: {
                listing_title: {
                    required: checkFieldRequired(listing_title),
                },
                year: {
                    required: checkFieldRequired(year)
                },
                stock_number: {
                    required: checkFieldRequired(stock_number)
                },
                vin_number: {
                    required: checkFieldRequired(vin_number)
                },
                mileage: {
                    required: checkFieldRequired(mileage)
                },
                engine_size: {
                    required: checkFieldRequired(engine_size)
                },
                door: {
                    required: checkFieldRequired(door)
                },
                seat: {
                    required: checkFieldRequired(seat)
                },
                city_mpg: {
                    required: checkFieldRequired(city_mpg)
                },
                highway_mpg: {
                    required: checkFieldRequired(highway_mpg)
                },
                regular_price: {
                    required: checkFieldRequired(regular_price)
                },
                sale_price: {
                    required: checkFieldRequired(sale_price)
                },
                'make[]': {
                    required: checkFieldRequired(make)
                },
                'model[]': {
                    required: checkFieldRequired(model)
                },
                'body[]': {
                    required: checkFieldRequired(body)
                },
                'condition[]': {
                    required: checkFieldRequired(condition)
                },
                'transmission[]': {
                    required: checkFieldRequired(transmission)
                },
                'drive-type[]': {
                    required: checkFieldRequired(drive_type)
                },
                'cylinders[]': {
                    required: checkFieldRequired(cylinders)
                },
                'fuel-type[]': {
                    required: checkFieldRequired(fuel_type)
                },
                'car-color[]': {
                    required: checkFieldRequired(car_color)
                },
                'features[]': checkFieldRequired(listing_feature) ? { at_least_one: true } : {},
                listing_other_agent_email: {
                    email: true
                }
            },
            messages: {
                listing_title: "",
                year: "",
                stock_number: "",
                vin_number: "",
                mileage: "",
                engine_size: "",
                door: "",
                seat: "",
                city_mpg: "",
                highway_mpg: "",
                'make[]': "",
                'model[]': "",
                'condition[]': "",
                'body[]': "",
                'transmission[]': "",
                'drive-type[]': "",
                'cylinders[]': "",
                'fuel-type[]': "",
                'car-color[]': "",
                'features[]': "",
                listing_other_agent_email: ""
            },
            submitHandler: function (form) {
                form.submit();
            }
        });
        $.validator.addMethod("at_least_one", function () {
            return $("input[name='features[]']:checked").length;
        }, '');

        $(document).on('select2:select select2:unselect', '#listing_make,#listing_model,#listing_body,#listing_condition,#listing_transmission,#listing_drive_type,#listing_cylinders,#listing_fuel_type,#listing_car_color', function (arg) {
            var elem = $(arg.target);
            if ((elem.val()) && typeof (elem.val()) == 'object') {
                if (elem.val().length == 0) {
                    elem.parent().find('.select2-container').addClass('error');
                } else {
                    elem.parent().find('.select2-container').removeClass('error');
                }
            }
        });
    }

    var listingGalleryImages = function () {
        /* initialize plupload */
        plupload_gallery = new plupload.Uploader({
            browse_button: 'tfcl_choose_gallery_images',
            file_data_name: 'image_file_name',
            container: 'tfcl_gallery_plupload_container',
            drop_element: 'tfcl_gallery_plupload_container',
            multi_selection: true,
            url: listing_variables.ajax_url_upload_gallery,
            filters: {
                mime_types: [
                    { title: listing_variables.file_type_title, extensions: listing_variables.image_file_type }
                ],
                max_file_size: listing_variables.image_max_file_size,
                prevent_duplicates: true
            }
        });
        plupload_gallery.init();

        plupload_gallery.bind('FilesAdded', function (up, files) {
            var listingGallery = "";
            var maxfiles = listing_variables.max_listing_images;
            var totalFiles = $('#tfcl_listing_gallery_container').find('.__thumb').length + up.files.length;
            if (totalFiles > maxfiles) {
                $.each(files, function (i, file) {
                    up.removeFile(file);
                });
                alert('Only upload max ' + maxfiles + ' file(s)');
                return;
            }
            plupload.each(files, function (file) {
                listingGallery += '<div id="img-' + file.id + '" class="col-sm-2 media-gallery-wrap"></div>';
            });
            document.getElementById('tfcl_listing_gallery_container').innerHTML += listingGallery;
            up.refresh();
            up.start();
        });

        plupload_gallery.bind('UploadProgress', function (up, file) {
            document.getElementById("img-" + file.id).innerHTML = '<span><i class="fa fa-spinner fa-spin"></i></span>';
        });

        plupload_gallery.bind('Error', function (up, err) {
            document.getElementById('tfcl_gallery_errors').innerHTML += "<br/>" + "Error #" + err.code + ": " + err.message;
        });

        plupload_gallery.bind('FileUploaded', function (up, file, ajax_response) {
            var response = $.parseJSON(ajax_response.response);

            if (response.success) {
                var $html =
                    '<figure class="media-thumb">' +
                    '<img loading="lazy" src="' + response.url + '"/>' +
                    '<div class="media-item-actions">' +
                    '<a class="icon icon-delete" data-listing-id="0"  data-img-id="' + response.attachment_id + '" href="javascript:;" ><i class="fa fa-times"></i></a>' +
                    '<input type="hidden" class="gallery_images" name="gallery_images[]" value="' + response.attachment_id + '"/>' +
                    '<span style="display: none;" class="icon icon-loader"><i class="fa fa-spinner fa-spin"></i></span>' +
                    '</div>' +
                    '</figure>';

                document.getElementById("img-" + file.id).innerHTML = $html;

                listingGalleryImagesEvent();
            }
        });
    }

    var sortableGalleryImages = function () {
        $('#tfcl_listing_gallery_container').sortable({
            flow: 'horizontal',
            wrapPadding: [10, 10, 0, 0],
            elMargin: [0, 0, 10, 10],
            elHeight: 'auto',
            filter: function (index) { return index !== 2; },
            timeout: 1000
        }).disableSelection();
    }

    var onClickViewListingType = function () {
        if ($('.tfcl-my-listing-search').length > 0) {
            $('a.btn-display-listing-grid').click(function (event) {
                event.preventDefault();
                localStorage.setItem('VIEW_LISTING_TYPE', 'grid');
                checkViewListing();
            });
            $('a.btn-display-listing-list').click(function (event) {
                event.preventDefault();
                localStorage.setItem('VIEW_LISTING_TYPE', 'list');
                checkViewListing();
            });
        }
    }

    var checkViewListing = function () {
        if ($('.tfcl-my-listing-search').length > 0) {
            var type = localStorage.getItem('VIEW_LISTING_TYPE');
            var dataCol = $('.wrap-tfcl-listing-card').data("col");
            switch (type) {
                case 'grid':
                    $('.wrap-tfcl-listing-card.cards-item').removeClass('col-md-6 col-6 style-list');
                    $('.wrap-tfcl-listing-card.cards-item').addClass(dataCol);
                    $('a.btn-display-listing-grid').addClass('active');
                    $('a.btn-display-listing-list').removeClass('active');
                    break;
                case 'list':
                    $('.wrap-tfcl-listing-card.cards-item').removeClass(dataCol);
                    $('.wrap-tfcl-listing-card.cards-item').attr('class', '').addClass('wrap-tfcl-listing-card cards-item col-md-6 col-6 style-list');
                    $('a.btn-display-listing-list').addClass('active');
                    $('a.btn-display-listing-grid').removeClass('active');
                    break;
                default:
                    break;
            }
        }
    }

    var clickSwitchLayoutColumnListing = function () {
            $('.tf-control-layout li').click(function () {
                var dataCol = $(this).data("col") + ' wrap-tfcl-listing-card cards-item';
                if (!$(this).hasClass('active')) {
                    $(this).closest('.tf-control-layout').find('li').removeClass('active');
                    $(this).addClass('active');
                }
                $(this).closest('.cards-container').find('.wrap-tfcl-listing-card').attr('class', '').addClass(dataCol);
            });
    }

    var clickMarkerEvent = function (map, infoWindow, marker, infoObj = []) {
        google.maps.event.addListener(marker, 'click', function () {
            makeInfoWindowEvent(map, infoWindow, marker, infoObj);

        });
    }

    var mouseoverListingGoogleMap = function (map, infoWindow, marker, infoObj = [], listingId) {
        $('.tfcl-listing-card').on('mouseover', function () {
            if ($(this).find('.card-image .tfre-image-map').attr('data-id') == listingId) {
                makeInfoWindowEvent(map, infoWindow, marker, infoObj);
            }
        });
    }

    var mouseoverListingMapBox = function (map, geoData) {
        $('.tfcl-listing-card').on('mouseover', function () {
            for (const feature of geoData.features) {
                if ($(this).find('.tfcl-image-map').attr('data-id') == feature.properties.property_id) {
                    jumpToListing(map, feature);
                    createPopupMap(map, feature);
                }
            }
        });
    }

    var getMarkers = function (res, attribute) {
        return {
            "type": "Feature",
            "properties": {
                "id": res.id,
                "title": attribute['title'],
                "location": attribute['data-location'],
                "image": attribute['data-image'],
                "featured": attribute['data-featured'],
                "year": attribute['data-year'],
                "condition": attribute['data-condition'],
                "mileage": attribute['data-mileage'],
                "fuel": attribute['data-fuel'],
                "trans": attribute['data-trans'],
                "price": attribute['data-price'],
                "price_prefix": attribute['data-price-prefix'],
                "price_suffix": attribute['data-price-suffix'],
                "property_id": attribute['data-id']
            },
            "geometry": {
                "type": "Point",
                "coordinates": res.center
            }
        }
    }

    var createPopupMap = function (map, currentListing) {
        var featuredAttr = currentListing.properties.featured != '' ? '<span class="featured">'+ currentListing.properties.featured +'</span>' : '';
        var dateAttr = currentListing.properties.year != '' ? '<span class="date">'+ currentListing.properties.year +'</span>' : '';
        var popupHtml = '<div class="pop-up-map">'
            + '<div class = "popup-content"> '
            + '<div class="popup-thumb">'+ featuredAttr + dateAttr +' <img loading="lazy" src="' + currentListing.properties.image + '" alt="' + currentListing.properties.title + '"></div>'
            + '<div class="pop-main-content">'
            + '<div class="popup-condition">' + currentListing.properties.condition + '</div>'
            + '<div class="popup-title">' + currentListing.properties.title + '</div>'
            + '<ul class="popup-desc"><li class="mileage">' + currentListing.properties.mileage + '</li><li class="fuel">' + currentListing.properties.fuel + '</li><li class="trans">' + currentListing.properties.trans + '</li></ul>'
            + '<div class="popup-price">' + currentListing.properties.price + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        const popUps = document.getElementsByClassName('mapboxgl-popup');
        if (popUps[0]) popUps[0].remove();

        new mapboxgl.Popup({
            anchor:'left',
            closeButton: true,
            closeOnClick: true,
            offset: 5,
            focusAfterOpen: false,
        }).setLngLat(currentListing.geometry.coordinates).setHTML(popupHtml).addTo(map);
    }

    var jumpToListing = function (map, currentListing) {
        map.jumpTo({
            center: currentListing.geometry.coordinates,
            zoom: listing_variables.map_zoom,
            pitch: 0,
            bearing: 0,
            essential: true,
            duration: 3000,
            speed: 1,
        });
    }

    var listingInMap = function () {
        var attributesArray = [];
        var elements = document.querySelectorAll('[data-id]');

        elements.forEach(function (element) {
            var attributes = element.attributes;
            var attributeObject = {};
            for (var i = 0; i < attributes.length; i++) {
                var attributeName = attributes[i].name;
                var attributeValue = attributes[i].value;
                attributeObject[attributeName] = attributeValue;
            }
            attributesArray.push(attributeObject);
        });

        const delay = 100;

        if (document.getElementById('map') && listing_variables.map_service == 'google-map') {
            var mapOptions = {
                center: new google.maps.LatLng(16.076305, 108.221548),
                zoom: parseInt(listing_variables.map_zoom),
            };
            var map = new google.maps.Map(document.getElementById('map'), mapOptions);
            var infoObj = [];
            var markers = [];
            var markerClusterOptions = {
                gridSize: 40,
                maxZoom: 15,
                styles: [{
                    width: 50,
                    height: 50,
                    url: 'data:image/svg+xml;base64,' + window.btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path fill="#D01818" stroke="#D01818" stroke-width="10" stroke-opacity="0.25" d="M15,5c5.524,0,10,4.478,10,10s-4.478,10-10,10S5,20.522,5,15S9.478,5,15,5z"/></svg>'),
                    textColor: '#000',
                    textSize: 12
                }]
            };
        }

        if (document.getElementById('map') && listing_variables.map_service == 'map-box') {
            var map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [108.221548, 16.076305], // [lng, lat]
                zoom: listing_variables.map_zoom,
                minZoom: 1,
                gestureHandling: 'cooperative',
                locations: [],
                draggable: false,
                scrollwheel: true,
                navigationControl: true,
                mapTypeControl: true,
                streetViewControl: false,
                pitchWithRotate: false,
                projection: 'equirectangular'
            });

            map.addControl(new mapboxgl.NavigationControl());

            map.on('load', () => {
                if (geoData.features.length == 0) return;
                jumpToListing(map, geoData.features[0]);

                map.loadImage(
                    listing_variables.default_marker_image ? listing_variables.default_marker_image :
                        listing_variables.plugin_url + 'public/assets/image/map/mapbox-marker.png',
                    (error, image) => {
                        if (error) throw error;
                        map.addImage('custom-marker', image);
                    });

                map.addSource('properties', {
                    type: 'geojson',
                    data: geoData,
                    cluster: true,
                    clusterMaxZoom: 6, // Max zoom to cluster points on
                    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                });

                map.addLayer({
                    id: 'clusters',
                    type: 'circle',
                    source: 'properties',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': [
                            'step',
                            ['get', 'point_count'],
                            '#D01818',
                            100,
                            '#f1f075',
                            750,
                            '#f28cb1'
                        ],
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            20,
                            100,
                            30,
                            750,
                            40
                        ]
                    }
                });

                map.addLayer({
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'properties',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': ['get', 'point_count_abbreviated'],
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 12
                    }
                });

                map.addLayer({
                    id: 'unclustered-point',
                    type: 'symbol',
                    source: 'properties',
                    filter: ['!', ['has', 'point_count']],
                    layout: {
                        'icon-image': 'custom-marker',
                        'icon-size': 0.55
                    }
                });

                // inspect a cluster on click
                map.on('click', 'clusters', (e) => {
                    const features = map.queryRenderedFeatures(e.point, {
                        layers: ['clusters']
                    });
                    const clusterId = features[0].properties.cluster_id;
                    map.getSource('properties').getClusterExpansionZoom(
                        clusterId,
                        (err, zoom) => {
                            if (err) return;

                            map.easeTo({
                                center: features[0].geometry.coordinates,
                                zoom: zoom
                            });
                        }
                    );
                });

                map.on('click', 'unclustered-point', (e) => {
                    createPopupMap(map, e.features[0])
                });

                map.on('mouseenter', 'clusters', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'clusters', () => {
                    map.getCanvas().style.cursor = '';
                });
                map.scrollZoom.disable();
            });
            mouseoverListingMapBox(map, geoData);
        }

        attributesArray.forEach(function (attribute) {
            if (attribute['data-location']) {
                setTimeout(function () {
                    if (document.getElementById('map') && listing_variables.map_service == 'map-box') {
                        $.ajax({
                            type: "GET",
                            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + attribute['data-location'] + ".json?access_token=" + mapboxgl.accessToken,
                            success: function (res) {
                                geoData.features.push(getMarkers(res.features[0], attribute));
                            }
                        });
                    }
                    if (document.getElementById('map') && listing_variables.map_service == 'google-map') {
                        geocoder.geocode({ 'address': attribute['data-location'] }, function (results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                map.setCenter(results[0].geometry.location);
                                map.setOptions({ draggable: true });

                                // Create a marker with custom content, image, and title
                                var marker = new google.maps.Marker({
                                    position: results[0].geometry.location,
                                    map: map,
                                    title: attribute['title'],
                                });
                                markers.push(marker);

                                // Create a custom info window
                                var infoWindow = new google.maps.InfoWindow({
                                    maxWidth: 240,
                                    pixelOffset: new google.maps.Size(0, -10),
                                    content: '<div class="pop-up-map">'
                                        + '<div class = "popup-content"> '
                                        + '<div class="popup-thumb"><img src="' + attribute['data-image'] + '" alt="' + attribute['title'] + '"></div>'
                                        + '<div class="pop-main-content">'
                                        + '<div class="popup-title">' + attribute['title'] + '</div>'
                                        + '<div class="popup-address">' + attribute['data-location'] + '</div>'
                                        + '<div class="popup-price">' + attribute['data-price-prefix'] + attribute['data-price'] + attribute['data-price-postfix'] + '</div>'
                                        + '</div>'
                                        + '</div>'
                                        + '</div>'
                                });
                                clickMarkerEvent(map, infoWindow, marker, infoObj);
                                mouseoverListingGoogleMap(map, infoWindow, marker, infoObj, attribute['data-id']);
                            } else {
                                console.log('Geocode was not successful for the following reason: ' + status);
                            }
                        });
                    }
                }, delay)
            }
        });

        if (document.getElementById('map') && listing_variables.map_service == 'google-map') {
            setTimeout(() => {
                new MarkerClusterer(map, markers, markerClusterOptions);
            }, 1500);
        }


    }

    var initMapSingleListing = function () {
        var latlng, marker, mapSingle,
            mapContainer = $('.map-container'),
            latlngSearching = mapContainer.find('.latlng_searching');

        if (!document.getElementById('map-single')) return;

        if (latlngSearching.length && latlngSearching.val() != '') {
            latlng = latlngSearching.val();
            latlng = latlng.split(',');
        }
        else {
            if (listing_variables.map_service == 'google-map') {
                latlng = [108.221548, 16.076305];
            }
            else {
                latlng = [0, 0];
            }
        }

        if (document.getElementById('map-single') && listing_variables.map_service == 'google-map') {
            var currentLocation = new google.maps.LatLng(latlng[0], latlng[1]);

            var mapOptions = {
                center: currentLocation,
                zoom: parseInt(listing_variables.map_zoom)
            };

            mapSingle = new google.maps.Map(document.getElementById('map-single'), mapOptions);

            marker = new google.maps.Marker({
                position: currentLocation,
                map: mapSingle,
            });

            mapSingle.setCenter(currentLocation);
            mapSingle.setOptions({ draggable: false });

            var request = {
                location: currentLocation,
                radius: '1500',
            };

            var service = new google.maps.places.PlacesService(mapSingle);

            service.nearbySearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    var result = [];
                    var html = '';
                    // Handle the registration success response
                    if (results.length <= 0) {
                        $('.nearby-place-wrapper').append('<p>No nearby places</p>');
                    } else {
                        result = results.reduce((newObj, data) => {
                            var array = newObj[data.types[0]] = newObj[data.types[0]] || [];
                            array[array.length] = data;
                            return newObj;
                        }, {});

                        Object.keys(result).forEach(function (key) {
                            html += '<div class="place"><div class="place-icon"><i class="far fa-map-marker-alt"></i></div><div class="place-info"><h4 class="place-title">' + key.split('_').join(' ') + '</h4><ul class="place-list">';
                            result[key].forEach(function (elem) {
                                var markerLatLng = new google.maps.LatLng(elem.geometry.location.lat(), elem.geometry.location.lng());
                                var distance_from_current_location = (google.maps.geometry.spherical.computeDistanceBetween(currentLocation, markerLatLng) / 1609.344).toFixed(3);
                                html += '<li>' + (elem.name) + '<span class="place-distance"> ' + distance_from_current_location + ' miles</span></li>';
                            })
                            html += '</ul></div></div>';
                        });

                        $('.nearby-place-wrapper').append(html);
                    }
                }
                else {
                    $('.nearby-place-wrapper').append('<p>No nearby places</p>');
                }
            });
        }

        if (document.getElementById('map-single') && listing_variables.map_service == 'map-box') {
            mapboxgl.accessToken = listing_variables.api_key_map_box ? listing_variables.api_key_map_box : '';

            mapSingle = new mapboxgl.Map({
                container: 'map-single',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [0, 0], // [lng, lat]
                zoom: listing_variables.map_zoom,
                minZoom: 1,
                gestureHandling: 'cooperative',
                locations: [],
                draggable: false,
                scrollwheel: true,
                navigationControl: true,
                mapTypeControl: true,
                streetViewControl: false,
                pitchWithRotate: false,
                projection: 'equirectangular'
            });
            mapSingle.addControl(new mapboxgl.NavigationControl());
            // Create custom marker
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = `url(${listing_variables.default_marker_image ? listing_variables.default_marker_image :
                listing_variables.plugin_url + 'public/assets/image/map/map-marker.png'})`;
            el.style.width = listing_variables.marker_image_width;
            el.style.height = listing_variables.marker_image_height;
            el.style.backgroundSize = '100%';
            el.style.backgroundRepeat = 'no-repeat';

            // Initialize the marker
            marker = new mapboxgl.Marker({ element: el, draggable: false });

            if (latlng) {
                mapSingle.flyTo({
                    center: [latlng[1], latlng[0]],
                    zoom: listing_variables.map_zoom,
                    pitch: 45,
                    bearing: 0,
                    essential: true,
                    duration: 3000,
                    speed: 1,
                });
                marker.setLngLat([latlng[1], latlng[0]]).addTo(mapSingle);
            }
        }
    }

    var initMapHeaderSingleListing = function () {
        var latlng, marker, mapHeaderSingle,
            mapContainer = $('.map-container'),
            latlngSearching = mapContainer.find('.latlng_searching');

        if (!document.getElementById('map-header')) return;

        if (latlngSearching.length && latlngSearching.val() !== '') {
            latlng = latlngSearching.val();
            latlng = latlng.split(',');
        }
        else {
            if (listing_variables.map_service == 'google-map') {
                latlng = [108.221548, 16.076305];
            }
            else {
                latlng = [0, 0];
            }
        }

        if (document.getElementById('map-header') && listing_variables.map_service == 'google-map') {
            var currentLocation = new google.maps.LatLng(latlng[0], latlng[1]);
            var mapOptions = {
                center: currentLocation,
                zoom: parseInt(listing_variables.map_zoom)
            };

            mapHeaderSingle = new google.maps.Map(document.getElementById('map-header'), mapOptions);

            marker = new google.maps.Marker({
                position: currentLocation,
                map: mapHeaderSingle,
            });
            mapHeaderSingle.setCenter(currentLocation);
            mapHeaderSingle.setOptions({ draggable: false });
        }

        if (document.getElementById('map-header') && listing_variables.map_service == 'map-box') {
            mapboxgl.accessToken = listing_variables.api_key_map_box ? listing_variables.api_key_map_box : '';
            mapHeaderSingle = new mapboxgl.Map({
                container: 'map-header',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [0, 0], // [lng, lat]
                zoom: listing_variables.map_zoom,
                minZoom: 1,
                gestureHandling: 'cooperative',
                locations: [],
                draggable: false,
                scrollwheel: true,
                navigationControl: true,
                mapTypeControl: true,
                streetViewControl: false,
                pitchWithRotate: false,
            });
            mapHeaderSingle.addControl(new mapboxgl.NavigationControl());

            // Create custom marker
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = `url(${listing_variables.default_marker_image ? listing_variables.default_marker_image :
                listing_variables.plugin_url + 'public/assets/image/map/map-marker.png'})`;
            el.style.width = listing_variables.marker_image_width;
            el.style.height = listing_variables.marker_image_height;
            el.style.backgroundSize = '100%';
            el.style.backgroundRepeat = 'no-repeat';

            // Initialize the marker
            marker = new mapboxgl.Marker({ element: el, draggable: false });

            if (latlng) {
                mapHeaderSingle.flyTo({
                    center: [latlng[1], latlng[0]],
                    zoom: listing_variables.map_zoom,
                    pitch: 45,
                    bearing: 0,
                    essential: true,
                    duration: 3000,
                    speed: 1,
                });
                marker.setLngLat([latlng[1], latlng[0]]).addTo(mapHeaderSingle);
            }
        }
    }

    var listingGalleryImagesEvent = function () {
        // Delete Image
        $('.icon-delete', '.tfcl-listing-gallery').off('click').on('click', function () {
            var $this = $(this),
                $wrap = $this.closest('.media-gallery-wrap'),
                file_id = $wrap.attr('id'),
                icon_delete = $this.children('i'),
                thumbnail = $this.closest('.media-gallery-wrap'),
                listing_id = $this.data('listing-id'),
                img_id = $this.data('img-id');
            if (typeof file_id !== typeof undefined && file_id !== false) {
                file_id = file_id.replace('img-', '');
            }

            icon_delete.addClass('fa-spinner fa-spin');
            $.ajax({
                type: 'post',
                url: listing_variables.ajax_url,
                dataType: 'json',
                data: {
                    'action': 'delete_img_or_file',
                    'listing_id': listing_id,
                    'attachment_id': img_id,
                    'type': 'image',
                    'deleteNonce': listing_variables.upload_nonce
                },
                success: function (response) {
                    if (response.success) {
                        thumbnail.remove();
                        thumbnail.hide();
                        if ((plupload_gallery)
                            && (typeof file_id !== typeof undefined && file_id !== false)) {
                            for (var i = 0; i < plupload_gallery.files.length; i++) {
                                if (plupload_gallery.files[i].id == file_id) {
                                    plupload_gallery.removeFile(plupload_gallery.files[i]);
                                    break;
                                }
                            }
                        }
                    }
                    icon_delete.removeClass('fa-spinner fa-spin');
                },
                error: function () {
                    icon_delete.removeClass('fa-spinner fa-spin');
                }
            });
        });
    }

    var listingFileAttachments = function () {
        /* initialize plupload */
        plupload_attachment = new plupload.Uploader({
            browse_button: 'tfcl_choose_attachment_files',
            file_data_name: 'file_attachments_name',
            container: 'tfcl_attachment_plupload_container',
            drop_element: 'tfcl_attachment_plupload_container',
            multi_selection: true,
            url: listing_variables.ajax_url_upload_file_attachment,
            filters: {
                mime_types: [
                    { title: listing_variables.file_type_title, extensions: listing_variables.attachment_file_type }
                ],
                max_file_size: listing_variables.attachment_max_file_size,
                prevent_duplicates: true
            }
        });
        plupload_attachment.init();

        plupload_attachment.bind('FilesAdded', function (up, files) {
            var listingAttachment = "";
            var maxfiles = listing_variables.max_listing_attachments;
            var totalFiles = $('#tfcl_listing_attachment_container').find('.__thumb').length + up.files.length;
            if (totalFiles > maxfiles) {
                $.each(files, function (i, file) {
                    up.removeFile(file);
                });
                alert('Only upload max ' + maxfiles + ' file(s)');
                return;
            }
            plupload.each(files, function (file) {
                listingAttachment += '<div id="file-' + file.id + '" class="col-sm-2 file-attachment-wrap"></div>';
            });
            document.getElementById('tfcl_listing_attachment_container').innerHTML += listingAttachment;
            up.refresh();
            up.start();
        });

        plupload_attachment.bind('UploadProgress', function (up, file) {
            document.getElementById("file-" + file.id).innerHTML = '<span><i class="fa fa-spinner fa-spin"></i></span>';
        });

        plupload_attachment.bind('Error', function (up, err) {
            document.getElementById('tfcl_attachment_errors').innerHTML += "<br/>" + "Error #" + err.code + ": " + err.message;
        });

        plupload_attachment.bind('FileUploaded', function (up, file, ajax_response) {
            var response = $.parseJSON(ajax_response.response);
            var fileType = response.file_name.split('.');
            var thumbUrl = listing_variables.plugin_url + 'public/assets/image/attachment/attach-' + fileType[1] + '.png';
            if (response.success) {
                var $html =
                    '<div class="file-attachment-wrap __thumb">' +
                    '<figure class="attachment-file">' +
                    '<img loading="lazy" src="' + thumbUrl + '"/>' +
                    '<a href="' + response.url + '">' + response.file_name + '</a>' +
                    '<div class="media-item-actions">' +
                    '<a class="icon icon-delete" data-listing-id="0"  data-attachment-id="' + response.attachment_id + '" href="javascript:;" ><i class="fa fa-times"></i></a>' +
                    '<input type="hidden" class="attachments_file" name="attachments_file[]" value="' + response.attachment_id + '"/>' +
                    '<span style="display: none;" class="icon icon-loader"><i class="fa fa-spinner fa-spin"></i></span>' +
                    '</div>' +
                    '</figure>' +
                    '</div>';

                document.getElementById("file-" + file.id).innerHTML = $html;
                listingFileAttachmentsEvent();
            }
        });
    }

    var listingFileAttachmentsEvent = function () {
        // Delete Image
        $('.icon-delete', '.tfcl-listing-attachment').off('click').on('click', function () {
            var $this = $(this),
                $wrap = $this.closest('.file-attachment-wrap'),
                file_id = $wrap.attr('id'),
                icon_delete = $this.children('i'),
                thumbnail = $this.closest('.file-attachment-wrap'),
                listing_id = $this.data('listing-id'),
                attachment_id = $this.data('attachment-id');
            if (typeof file_id !== typeof undefined && file_id !== false) {
                file_id = file_id.replace('file-', '');
            }

            icon_delete.addClass('fa-spinner fa-spin');
            $.ajax({
                type: 'post',
                url: listing_variables.ajax_url,
                dataType: 'json',
                data: {
                    'action': 'delete_img_or_file',
                    'listing_id': listing_id,
                    'attachment_id': attachment_id,
                    'type': 'attachment',
                    'deleteNonce': listing_variables.upload_nonce
                },
                success: function (response) {
                    if (response.success) {
                        thumbnail.remove();
                        thumbnail.hide();
                        if ((plupload_attachment)
                            && (typeof file_id !== typeof undefined && file_id !== false)) {
                            for (var i = 0; i < plupload_attachment.files.length; i++) {
                                if (plupload_attachment.files[i].id == file_id) {
                                    plupload_attachment.removeFile(plupload_attachment.files[i]);
                                    break;
                                }
                            }
                        }
                    }
                    icon_delete.removeClass('fa-spinner fa-spin');
                },
                error: function () {
                    icon_delete.removeClass('fa-spinner fa-spin');
                }
            });
        });
    }

    var galleryCarousel = function () {

        if ($('.single-listing-image-main.slider-1').length > 0) {
            if ($().owlCarousel) {
                $('.single-listing-image-main.slider-1').owlCarousel({
                    items: 1,
                    loop: false,
                    margin: 25,
                    nav: true,
                    dots: true,
                    smartSpeed: 500,
                    slideSpeed: 500,
                    autoplay: false,
                    autoplayTimeout: 5000,
                    smartSpeed: 850,
                    autoplayHoverPause: true,
                    navText: ['<i class="icon-autodeal-icon-85">', '<i class="icon-autodeal-icon-86">'],
                });
            }
        }

        if ($('.single-listing-image-main.slider-3').length > 0) {
            if ($().owlCarousel) {
                $('.single-listing-image-main.slider-3').owlCarousel({
                    items: 3,
                    loop: false,
                    margin: 10,
                    nav: true,
                    dots: true,
                    smartSpeed: 500,
                    slideSpeed: 500,
                    autoplay: false,
                    autoplayTimeout: 5000,
                    smartSpeed: 850,
                    autoplayHoverPause: true,
                    navText: ['<i class="icon-autodeal-icon-85">', '<i class="icon-autodeal-icon-86">'],
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1000: {
                            items: 3
                        },
                    }
                }
            
            );
            indexActiveAddClasses();

            $('.single-listing-image-main.slider-3').on('translated.owl.carousel', function(event) {
                indexActiveAddClasses();
            });
            function indexActiveAddClasses(){
                var total = $('.single-listing-image-main.slider-3').find(' .owl-stage .owl-item.active').length;
                $('.single-listing-image-main.slider-3').find(' .owl-stage .owl-item').removeClass('firstActiveItem lastActiveItem'); 
                $('.single-listing-image-main.slider-3').find(' .owl-stage .owl-item.active').each(function(index){ 
                    if (index === 0) {
                        $(this).addClass('firstActiveItem');
                    }
                    if (index === total - 1 && total>1) {
                        $(this).addClass('lastActiveItem');
                    }
                });
                $('.single-listing-image-main.slider-3').find(' .owl-stage .owl-item').removeClass('indexActiveItem'); 
                $('.single-listing-image-main.slider-3').find(' .owl-stage .owl-item.active').each(function(index){                         
                    if (index === 1) {
                        $(this).addClass('indexActiveItem');
                    }
                });
            }       

            }
        }

        if ($('.tfcl-listing-info.slider-4').length > 0) {
        $(document).ready(function () {
            $(window).on("resize load", function (e) {
                var newWindowWidth = $(window).width();
                if (newWindowWidth < 767) {
                    if ($().owlCarousel) {
                        $('.tfcl-listing-info.slider-4').owlCarousel({
                            items: 1,
                            loop: false,
                            margin: 30,
                            nav: true,
                            dots: false,
                            smartSpeed: 500,
                            slideSpeed: 500,
                            autoplay: false,
                            autoplayTimeout: 5000,
                            smartSpeed: 850,
                            navText: ['<i class="icon-autodeal-icon-85">', '<i class="icon-autodeal-icon-86">'],
                        });
                    }
                }else {
                    $('.tfcl-listing-info.slider-4').owlCarousel('destroy');
                }
            });
        });
        }

    }

    var favorite = function () {
        $('.tfcl-listing-favorite').on('click', function (event) {
            event.preventDefault();
            var $messages = $('.tfcl_message');
            if (!$(this).hasClass('on-handle')) {
                var $this = $(this).addClass('on-handle'),
                    listing_id = $this.attr('data-tfcl-car-id'),
                    title_not_favorite = $this.attr('data-tfcl-title-not-favorite'),
                    icon_not_favorite = $this.attr('data-tfcl-icon-not-favorite'),
                    title_favorited = $this.attr('data-tfcl-title-favorited'),
                    icon_favorited = $this.attr('data-tfcl-icon-favorited');
                $.ajax({
                    type: 'post',
                    url: listing_variables.ajax_url,
                    dataType: 'json',
                    data: {
                        'action': 'tfcl_favorite_ajax',
                        'listing_id': listing_id
                    },
                    beforeSend: function () {
                        $this.children('i').removeClass(icon_not_favorite).addClass('far fa-spinner fa-spin');
                    },
                    success: function (response) {
                        if ((typeof (response.added) == 'undefined') || (response.added == -1)) {
                            alert(response.message);
                            $this.children('i').addClass(icon_not_favorite);
                        }
                        if (response.added == 1) {
                            $this.children('i').removeClass(icon_not_favorite).addClass(icon_favorited);
                            $this.attr('data-tooltip', title_favorited);
                            $this.addClass('active');
                        } else if (response.added == 0) {
                            $this.children('i').removeClass(icon_favorited).addClass(icon_not_favorite);
                            $this.attr('data-tooltip', title_not_favorite);
                            $this.removeClass('active');
                        } else if (response.added == -1) {
                            alert(response.message);
                            $this.children('i').addClass(icon_not_favorite);
                        }
                        $this.children('i').removeClass('fa-spinner fa-spin');
                        $this.removeClass('on-handle');
                    },
                    error: function () {
                        $this.children('i').removeClass('fa-spinner fa-spin');
                        $this.removeClass('on-handle');
                    }
                });
            }
        });
    }

    var removeFavorite = function () {
        $('.tfcl-favorite-remove').on('click', function (event) {
            event.preventDefault();
            var $messages = $('.tfcl_message');
            var confirmed = confirm(listing_variables.confirm_remove_listing_favorite);
            if (!$(this).hasClass('on-handle') && confirmed) {
                var $this = $(this).addClass('on-handle'),
                    listing_id = $this.attr('data-tfcl-car-id');
                $.ajax({
                    type: 'post',
                    url: listing_variables.ajax_url,
                    dataType: 'json',
                    data: {
                        'action': 'tfcl_favorite_ajax',
                        'listing_id': listing_id
                    },
                    beforeSend: function () {
                        $this.children('i').addClass('fa-spinner fa-spin');
                    },
                    success: function (response) {
                        if ((typeof (response.added) == 'undefined') || response.added == -1) {
                            $messages.empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
                        } else {
                            $this.closest('.favorite-listing').parent('td').parent('tr').remove();
                            var row_data_length = $('#tfcl_my_favorite > tbody >  tr').length
                            if (row_data_length == 0) {
                                resetToPreviousPage();
                            }
                        }
                    },
                    error: function () {
                        $this.children('i').removeClass('fa-spinner fa-spin');
                        $this.removeClass('on-handle');
                    }
                });
            }
        });
    }

    var resetToPreviousPage = function () {
        var currentUrl = window.location.href;
        var regex = /page\/(\d+)/;
        var matches = currentUrl.match(regex);
        var pageValue = matches ? matches[1] : null;
        if (pageValue == 2) {
            var newUrl = currentUrl.replace(/\/page\/(\d+)/, '');
            window.location.href = newUrl;
        } else if (pageValue > 2) {
            var previous_page = pageValue - 1;
            var newUrl = currentUrl.replace(/\/page\/([^\/]+)/, "/page/" + previous_page);
            window.location.href = newUrl;
        } else {
            window.location.reload();
        }
    }

    var updateIndexAdditionalDetail = function () {
        $('tr', '#tfcl_additional_detail').each(function (idx, elm) {
            var inputAdditionalDetailTitle = $('input[id*="additional_detail_title"]', $(this)),
                inputAdditionalDetailValue = $('input[id*="additional_detail_value"]', $(this)),
                inputAdditionalDetailIcon = $('input[id*="additional_detail_icon"]', $(this));
            inputAdditionalDetailTitle.attr('id', 'additional_detail_title_' + idx);
            inputAdditionalDetailTitle.attr('name', 'listing_additional_detail[' + idx + '][additional_detail_title]');
            inputAdditionalDetailValue.attr('id', 'additional_detail_value_' + idx);
            inputAdditionalDetailValue.attr('name', 'listing_additional_detail[' + idx + '][additional_detail_value]');
            inputAdditionalDetailIcon.attr('id', 'additional_detail_icon_' + idx);
            inputAdditionalDetailIcon.attr('name', 'listing_additional_detail[' + idx + '][additional_detail_icon]');
        });
    }

    var removeAdditionalDetail = function () {
        $('.remove-additional-detail').on('click', function (e) {
            e.preventDefault();
            var parent = $(this).closest('.additional-block'),
                btnAdd = parent.find('.add-additional-detail'),
                incrementNum = parseInt(btnAdd.attr('data-increment')) - 1;
            $(this).parent('td').parent('tr').remove();
            btnAdd.attr('data-increment', incrementNum);
            updateIndexAdditionalDetail();
        });
    }

    var addNewAdditionalDetail = function () {
        $('.add-additional-detail').on('click', function (e) {
            e.preventDefault();
            var rowNum = parseInt($(this).attr('data-increment')) + 1;
            $(this).attr('data-increment', rowNum);
            var newAdditionalDetailRow = '<tr>' +
                '<td>' +
                '<input type="text" class="form-control" name="listing_additional_detail[' + rowNum + '][additional_detail_icon]" id="additional_detail_icon_' + rowNum + '" value="" />'
                + '</td>' +
                '<td>' +
                '<input type="text" class="form-control" name="listing_additional_detail[' + rowNum + '][additional_detail_title]" id="additional_detail_title_' + rowNum + '" value="" />'
                + '</td>' +
                '<td>' +
                '<input type="text" class="form-control" name="listing_additional_detail[' + rowNum + '][additional_detail_value]"  id="additional_detail_value_' + rowNum + '" value="" />'
                + '</td>' +
                '<td>' +
                '<span class="remove-additional-detail"><i class="icon-autodeal-close"></i></span>'
                + '</td>'
                + '</tr>'
            $('#tfcl_additional_detail').append(newAdditionalDetailRow);
            removeAdditionalDetail();
        });
    }

    var onClickShowMoreSingleListingShortDescription = function () {
        var textShow = $('.tf-show-hide-description').data('show');
        var textHide = $('.tf-show-hide-description').data('hide');
        $('.button-show-hide').click(function () {
            if($(this).hasClass('show')) {
                $(this).removeClass('show');
                $(this).addClass('hide');
                $(this).text(textShow);
                $(this).closest('.tf-show-hide-description').find('.inner').removeClass('show-content');
                $(this).closest('.tf-show-hide-description').find('.inner').addClass('hide-content');
            }else {
                $(this).removeClass('hide');
                $(this).addClass('show');
                $(this).text(textHide);
                $(this).closest('.tf-show-hide-description').find('.inner').removeClass('hide-content');
                $(this).closest('.tf-show-hide-description').find('.inner').addClass('show-content');
            }
        });
    }

    var getModelOfMake = function (resetValue) {
        var $this = $('.tfcl-listing-make-ajax');
        if ($this.length) {
            var selectedMake = $this.val();
            $.ajax({
                type: 'POST',
                url: listing_variables.ajax_url,
                data: {
                    'action': 'get_model_by_make_ajax',
                    'make': selectedMake,
                    'type': 1,
                    'is_slug': '1'
                },
                beforeSend: function () {
                    $('.tfcl-listing-model-ajax').attr('disabled', true);
                },
                success: function (res) {
                    var selectedModel = resetValue ? undefined : $('.tfcl-listing-model-ajax').val();
                    $('.tfcl-listing-model-ajax').html(res);
                    if (typeof (selectedModel) !== 'undefined') {
                        $('.tfcl-listing-model-ajax').val(selectedModel);
                    }
                },
                complete: function () {
                    $('.tfcl-listing-model-ajax').attr('disabled', false);
                }
            })
        }
    }

    var viewGalleryMagnificPopup = function () {
        $('[data-mfp-event]').each(function () {
            var $this = $(this),
                defaults = {
                    type: 'image',
                    closeOnBgClick: true,
                    closeBtnInside: false,
                    mainClass: 'mfp-zoom-in',
                    midClick: true,
                    removalDelay: 500,
                    callbacks: {
                        beforeOpen: function () {
                            // just a hack that adds mfp-anim class to markup
                            switch (this.st.type) {
                                case 'image':
                                    this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                                    break;
                                case 'iframe':
                                    this.st.iframe.markup = this.st.iframe.markup.replace('mfp-iframe-scaler', 'mfp-iframe-scaler mfp-with-anim');
                                    break;
                            }
                        },
                        beforeClose: function () { },
                        close: function () { },
                        change: function () {
                            var _this = this;
                            if (this.isOpen) {
                                this.wrap.removeClass('mfp-ready');
                                setTimeout(function () {
                                    _this.wrap.addClass('mfp-ready');
                                }, 10);
                            }
                        }
                    }
                },
                mfpConfig = $.extend({}, defaults, $this.data("mfp-options"));

            var gallery = $this.data('gallery');
            if ((typeof (gallery) !== "undefined")) {
                var items = [],
                    items_src = [];

                if (gallery && gallery.length !== 0) {
                    for (var i = 0; i < gallery.length; i++) {
                        var src = gallery[i];
                        if (items_src.indexOf(src) < 0) {
                            items_src.push(src);
                            items.push({
                                src: src
                            });
                        }
                    }
                }

                mfpConfig.items = items;
                mfpConfig.gallery = {
                    enabled: true
                };
                mfpConfig.callbacks.beforeOpen = function () {
                    switch (this.st.type) {
                        case 'image':
                            this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                            break;
                        case 'iframe':
                            this.st.iframe.markup = this.st.iframe.markup.replace('mfp-iframe-scaler', 'mfp-iframe-scaler mfp-with-anim');
                            break;
                    }
                };
            }

            $this.magnificPopup(mfpConfig);
        });
    }

    var hoverActiveGallery = function () {
        if ($('.container-grid-gallery').length) {
            $(document).ready(function() {
                $('.tfcl-listing-gallery-single .tfcl-listing-info.style-grid .listing-gallery-item').click(
                  function() {
                    $(this).closest('.tfcl-listing-info').find('.listing-gallery-item').removeClass('active');
                    $(this).addClass('active');
                  }
                );
            });
        }
    }

    var disableNegativeNumberInput = function () {
        $("input[type='number']").on('input', function (e) {
            var input = $(this),
                oldVal = input.val(),
                newVal = (parseFloat(oldVal) < 0) ? oldVal * -1 : oldVal;
            if (newVal != 0) {
                input.val(newVal);
            }
        });
    }

    function inputFloatNumber(selector) {
        $(selector).on('input', function (e) {
            var input = $(this);
            var oldVal = input.val();
            var floatNumberVal = oldVal.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
            input.val(floatNumberVal);
        });
    }

    var light_gallery = function () {
        var adminbar = $("#wpadminbar").height();
        $("[data-rel='tfcl_light_gallery']").each(function () {
            var $this = $(this),
                galleryId = $this.data('gallery-id');
            $this.on('click', function (event) {
                event.preventDefault();
                var _data = [];
                var $index = 0;
                var $current_src = $(this).attr('href');
                var $current_thumb_src = $(this).data('thumb-src');
                if ($("#wpadminbar").length) {
                    $(this).delay(500).queue(function () {
                        $(".lg-toolbar").css({ top: adminbar });
                        $(this).dequeue();
                    });
                }
                if (typeof galleryId != 'undefined') {
                    $('[data-gallery-id="' + galleryId + '"]').each(function (index) {
                        var src = $(this).attr('href'),
                            thumb = $(this).data('thumb-src'),
                            subHtml = $(this).attr('title');
                        if (src == $current_src && thumb == $current_thumb_src) {
                            $index = index;
                        }
                        if (typeof (subHtml) == 'undefined')
                            subHtml = '';
                        _data.push({
                            'src': src,
                            'downloadUrl': src,
                            'thumb': thumb,
                            'subHtml': subHtml
                        });
                    });

                    $this.lightGallery({
                        hash: false,
                        galleryId: galleryId,
                        dynamic: true,
                        dynamicEl: _data,
                        thumbWidth: 80,
                        index: $index
                    });
                }
            });
        });
        $('span.tfcl-view-video').on('click', function (event) {
            event.preventDefault();
            var $src = $(this).attr('data-src');
            $(this).lightGallery({
                dynamic: true,
                dynamicEl: [{
                    'src': $src,
                    'thumb': '',
                    'subHtml': ''
                }]
            });
        });
    }

    var onClickPrint = function () {
        $('a.tfcl-listing-print').on('click', function (e) {
            window.print();
        });
    }

    var accordionFeatures = function () {
        if ($('.tab-features').length) {
            var speed = {duration: 400};            
            $('.tab-features .features-inner').hide();
            $('.tab-features #tfcl-features .features-item:first .features-inner').show();
            $('.tab-features .features-type-title').on('click', function (e) {
                $(this).closest('.features-item').siblings().find('.features-type-title').removeClass('active');
                $(this).closest('.features-item').siblings().removeClass('active');
                $(this).closest('.features-item').addClass('active');
                $(this).toggleClass('active');
                $(this).closest('.features-item').siblings().find('.features-inner').slideUp(speed);
                $(this).closest('.features-item').find('.features-inner').slideToggle(speed);
            });
        }
    }

    var stickyTabs = function () {
        if ($('.listing-tab-item').length) {

            var sectionSticky = $('.listing-tab-item .tab-item').offset().top;

            $(window).on("load scroll resize", function () {

                // var sectionOut = $('.gallery-style-slider-2 .related-single-listing').offset().top - 200;
                var adminbar = $('#wpadminbar').length ? $("#wpadminbar").height() : 0;
                var header = $('.header_sticky').length ? $("#header").height() : 0;
                $('.listing-tab-item .tab-item').css({ top: adminbar + header });
                if ($(window).scrollTop() >= (sectionSticky - 60)) {
                    $('.listing-tab-item .tab-item').addClass("is-fixed");
                } else {
                    $('.listing-tab-item .tab-item').removeClass("is-fixed");
                }
                // if ($(window).scrollTop() >= sectionOut) {
                //     $('.listing-tab-item .tab-item').hide();
                // } else {
                //     $('.listing-tab-item .tab-item').show();
                // }
                if (matchMedia("only screen and (max-width: 767px)").matches) {
                    $('.listing-tab-item .tab-item').css({ top: header + 10 });
                }
            });

            $(window).on('scroll', function () {
                var scrollbarLocation = $(this).scrollTop();
                $('.item-nav').each(function () {
                    var sectionOffset = $(this.hash);
                    sectionOffset = $(this.hash).offset().top - 230;
                    if (sectionOffset <= scrollbarLocation) {
                        $(this).parent().addClass('active');
                        $(this).parent().siblings().removeClass('active');
                    }
                });
            });

            $('a.item-nav[href*="#"]:not([href="#"])').on('click', function () {
                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                    var target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                    if (target.length) {
                        $('html, body').animate({
                            scrollTop: (target.offset().top - 220)
                        }, 500, "easeInOutExpo");
                        return false;
                    }
                }
            });
        }
    }

    var stickySideBar = function () {
        if ($('.tfcl_single_sidebar, .tfcl_sidebar, .tfcl-sidebar-dealer').length) {
            $(window).on("load scroll resize", function () {
                var adminbar = $('#wpadminbar').length ? $("#wpadminbar").height() : 0;
                var header = $('.header_sticky').length ? $("#header").height() : 0;
                var tab = $('.listing-tab-item .tab-item').length ? 70 : 0;
                if ($(window).scrollTop() > 500) {
                    $('.tfcl_single_sidebar, .tfcl_sidebar, .tfcl-sidebar-dealer').css({ top: adminbar + header + tab + 20 });
                } else {
                    $('.tfcl_single_sidebar, .tfcl_sidebar, .tfcl-sidebar-dealer').css({ top: 0 });
                }
            });
        }
    }

    var popupSearchFilter = function () {
        if ($(".popup-search-map").length > 0) {
            $('body').addClass('filter-search-map');
            $('.filter-popup').on('click', function () {
                $(this).closest('body').find('.popup-search-map').addClass('active');
            });
            $('.search-filter-inner .btn-close-popup, .popup-search-map .overlay').on('click', function () {
                $(this).closest('body').find('.popup-search-map').removeClass('active');
            });
        }
    }

    var niceSelectForm = function () {
        if ($("select").length > 0) {
            $('select:not(.add-list-model)').niceSelect();
        }
    };

    var datePicker = function () {
        $('.datetimepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            minDate: new Date(0),
        });
    };

    $(document).ready(function () {
        handleSaveListingAjax();
        checkFieldRequired();
        hoverActiveGallery();
        validateSaveListingForm();
        listingFileAttachments();
        listingFileAttachmentsEvent();
        listingGalleryImagesEvent();
        listingGalleryImages();
        accordionFeatures();
        galleryCarousel();
        favorite();
        popupSearchFilter();
        removeFavorite();
        onClickShowMoreSingleListingShortDescription();
        disableNegativeNumberInput();
        inputFloatNumber("input[type='text']#listing_engine_size");
        viewGalleryMagnificPopup();
        light_gallery();
        onClickPrint();
        sortableGalleryImages();
        stickySideBar();
        niceSelectForm();
        datePicker();
        clickSwitchLayoutColumnListing();
        

        // Additional Detail
        addNewAdditionalDetail();
        removeAdditionalDetail();
        onClickViewListingType();
        // checkViewListing();

        // Map
        listingInMap();
        initMapSingleListing();

        if (listing_variables.map_service == 'google-map') {
            mouseoverListingGoogleMap();
        }

        // Get model by make
        getModelOfMake(false);
        $('.tfcl-listing-make-ajax').on('change', function () {
            getModelOfMake(true);
        });

        $(window).load(function () {
            setTimeout(function () {
                stickyTabs();
            }, 300)
        });
    });

})(jQuery);