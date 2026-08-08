jQuery(function ($) {

    console.log('MMI Content Builder Loaded');

    /**
     * Load Categories
     */
    function loadCategories() {

        var source = $('#mmi_cs_source').val();
        var selectedCategory = $('#mmi_cs_category').data('selected');

        if (source === '') {
            return;
        }

        $('#mmi-cs-spinner').addClass('is-active');

        $.ajax({

            url: MMI_CS.ajax_url,

            type: 'POST',

            dataType: 'json',

            data: {
                action: 'mmi_cs_load_categories',
                nonce: MMI_CS.nonce,
                source: source
            },

            success: function (response) {

                $('#mmi-cs-spinner').removeClass('is-active');

                if (!response.success) {
                    alert(response.data);
                    return;
                }

                var $category = $('#mmi_cs_category');

                $category.empty();

                $category.append(
                    $('<option>', {
                        value: '',
                        text: 'Select Category'
                    })
                );

                $.each(response.data, function (index, item) {

                    $category.append(
                        $('<option>', {
                            value: item.id,
                            text: item.name
                        })
                    );

                });

                if (selectedCategory) {
                    $category.val(selectedCategory);
                }

            },

            error: function (xhr) {

                $('#mmi-cs-spinner').removeClass('is-active');

                console.log(xhr);
                console.log(xhr.responseText);

                alert(xhr.responseText);

            }

        });

    }

    /**
     * Manual Button
     */
    $('#mmi-cs-load-categories').on('click', function () {
        loadCategories();
    });

    /**
     * Auto Load on Edit Screen
     */
    if ($('#mmi_cs_source').val() !== '') {
        loadCategories();
    }

});