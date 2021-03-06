'use strict';

var csrf;

function initCommentForm() {
    if ($('.comment.form').length == 0) {
        return
    }

    var $form = $('.comment.form');
    $form.find('.tabular.menu .item').tab();
    $form.find('.tabular.menu .item[data-tab="preview"]').click(function () {
        var $this = $(this);
        $.post($this.data('url'), {
                "_csrf": csrf,
                "mode": "gfm",
                "context": $this.data('context'),
                "text": $form.find('.tab.segment[data-tab="write"] textarea').val()
            },
            function (data) {
                $form.find('.tab.segment[data-tab="preview"]').html(data);
            }
        );
    });

    // Labels
    var $list = $('.ui.labels.list');
    var $no_select = $list.find('.no-select');
    var $label_menu = $('.select-label .menu');
    var has_label_update_action = $label_menu.data('action') == 'update';

    function updateIssueMeta(url, action, id) {
        $.post(url, {
            "_csrf": csrf,
            "action": action,
            "id": id
        });
    }

    $label_menu.find('.item:not(.no-select)').click(function () {
        if ($(this).hasClass('checked')) {
            $(this).removeClass('checked')
            $(this).find('.octicon').removeClass('octicon-check')
            if (has_label_update_action) {
                updateIssueMeta($label_menu.data('update-url'), "detach", $(this).data('id'));
            }
        } else {
            $(this).addClass('checked')
            $(this).find('.octicon').addClass('octicon-check')
            if (has_label_update_action) {
                updateIssueMeta($label_menu.data('update-url'), "attach", $(this).data('id'));
            }
        }

        var label_ids = "";
        $(this).parent().find('.item').each(function () {
            if ($(this).hasClass('checked')) {
                label_ids += $(this).data('id') + ",";
                $($(this).data('id-selector')).removeClass('hide');
            } else {
                $($(this).data('id-selector')).addClass('hide');
            }
        });
        if (label_ids.length == 0) {
            $no_select.removeClass('hide');
        } else {
            $no_select.addClass('hide');
        }
        $($(this).parent().data('id')).val(label_ids);
        return false;
    });
    $label_menu.find('.no-select.item').click(function () {
        if (has_label_update_action) {
            updateIssueMeta($label_menu.data('update-url'), "clear", '');
        }

        $(this).parent().find('.item').each(function () {
            $(this).removeClass('checked');
            $(this).find('.octicon').removeClass('octicon-check');
        });

        $list.find('.item').each(function () {
            $(this).addClass('hide');
        });
        $no_select.removeClass('hide');
        $($(this).parent().data('id')).val('');
    });

    function selectItem(select_id, input_id) {
        var $menu = $(select_id + ' .menu');
        var $list = $('.ui' + select_id + '.list')
        var has_update_action = $menu.data('action') == 'update';

        $menu.find('.item:not(.no-select)').click(function () {
            $(this).parent().find('.item').each(function () {
                $(this).removeClass('selected active')
            });

            $(this).addClass('selected active');
            if (has_update_action) {
                updateIssueMeta($menu.data('update-url'), '', $(this).data('id'));
            }
            switch (input_id) {
                case '#milestone_id':
                    $list.find('.selected').html('<a class="item" href=' + $(this).data('href') + '>' +
                        $(this).text() + '</a>');
                    break;
                case '#assignee_id':
                    $list.find('.selected').html('<a class="item" href=' + $(this).data('href') + '>' +
                        '<img class="ui avatar image" src=' + $(this).data('avatar') + '>' +
                        $(this).text() + '</a>');
            }
            $('.ui' + select_id + '.list .no-select').addClass('hide');
            $(input_id).val($(this).data('id'));
        });
        $menu.find('.no-select.item').click(function () {
            $(this).parent().find('.item:not(.no-select)').each(function () {
                $(this).removeClass('selected active')
            });

            if (has_update_action) {
                updateIssueMeta($menu.data('update-url'), '', '');
            }

            $list.find('.selected').html('');
            $list.find('.no-select').removeClass('hide');
            $(input_id).val('');
        });
    }

    // Milestone and assignee
    selectItem('.select-milestone', '#milestone_id');
    selectItem('.select-assignee', '#assignee_id');
}

function initInstall() {
    if ($('.install').length == 0) {
        return;
    }

    // Database type change detection.
    $("#db_type").change(function () {
        var db_type = $('#db_type').val();
        if (db_type === "SQLite3") {
            $('#sql_settings').hide();
            $('#pgsql_settings').hide();
            $('#sqlite_settings').show();
            return;
        }

        var mysql_default = '127.0.0.1:3306';
        var postgres_default = '127.0.0.1:5432';

        $('#sqlite_settings').hide();
        $('#sql_settings').show();
        if (db_type === "PostgreSQL") {
            $('#pgsql_settings').show();
            if ($('#db_host').val() == mysql_default) {
                $('#db_host').val(postgres_default);
            }
        } else {
            $('#pgsql_settings').hide();
            if ($('#db_host').val() == postgres_default) {
                $('#db_host').val(mysql_default);
            }
        }
    });
};

function initRepository() {
    if ($('.repository').length == 0) {
        return;
    }

    // Labels
    if ($('.repository.labels').length > 0) {
        // Create label
        var $new_label_panel = $('.new-label.segment');
        $('.new-label.button').click(function () {
            $new_label_panel.show();
        });
        $('.new-label.segment .cancel').click(function () {
            $new_label_panel.hide();
        });

        $('.color-picker').each(function () {
            $(this).minicolors();
        });
        $('.precolors .color').click(function () {
            var color_hex = $(this).data('color-hex')
            $('.color-picker').val(color_hex);
            $('.minicolors-swatch-color').css("background-color", color_hex);
        });
        $('.edit-label-button').click(function () {
            $('#label-modal-id').val($(this).data('id'));
            $('.edit-label .new-label-input').val($(this).data('title'));
            $('.minicolors-swatch-color').css("background-color", $(this).data('color'));
            $('.edit-label.modal').modal({
                onApprove: function () {
                    $('.edit-label.form').submit();
                }
            }).modal('show');
            return false;
        });
    }

    // Milestones
    if ($('.repository.milestones').length > 0) {

    }
    if ($('.repository.new.milestone').length > 0) {
        var $datepicker = $('.milestone.datepicker')
        $datepicker.datetimepicker({
            lang: $datepicker.data('lang'),
            inline: true,
            timepicker: false,
            startDate: $datepicker.data('start-date'),
            formatDate: 'Y-m-d',
            onSelectDate: function (ct) {
                $('#deadline').val(ct.dateFormat('Y-m-d'));
            }
        });
        $('#clear-date').click(function () {
            $('#deadline').val('');
            return false;
        });
    }

    // Settings
    if ($('.repository.settings').length > 0) {
        $('#add-deploy-key').click(function () {
            $('#add-deploy-key-panel').show();
        });
    }

    // Issues
    if ($('.repository.view.issue').length > 0) {
        var $status_btn = $('#status-button');
        $('#content').keyup(function () {
            if ($(this).val().length == 0) {
                $status_btn.text($status_btn.data('status'))
            } else {
                $status_btn.text($status_btn.data('status-and-comment'))
            }
        });
        $status_btn.click(function () {
            $('#status').val($status_btn.data('status-val'));
            $('#comment-form').submit();
        })
    }

    // Pull request
    if ($('.repository.compare.pull').length > 0) {
        var $branch_dropdown = $('.choose.branch .dropdown')
        $branch_dropdown.dropdown({
            fullTextSearch: true,
            onChange: function (text, value, $choice) {
                window.location.href = $choice.data('url');
            },
            message: {noResults: $branch_dropdown.data('no-results')}
        });
    }
};

$(document).ready(function () {
    csrf = $('meta[name=_csrf]').attr("content");

    // Show exact time
    $('.time-since').each(function () {
        $(this).addClass('poping up').
            attr('data-content', $(this).attr('title')).
            attr('data-variation', 'inverted tiny').
            attr('title', '');
    });

    // Semantic UI modules.
    $('.dropdown').dropdown();
    $('.jump.dropdown').dropdown({
        action: 'hide',
        onShow: function () {
            $('.poping.up').popup('hide');
        }
    });
    $('.slide.up.dropdown').dropdown({
        transition: 'slide up'
    });
    $('.ui.accordion').accordion();
    $('.ui.checkbox').checkbox();
    $('.ui.progress').progress({
        showActivity: false
    });
    $('.poping.up').popup();
    $('.top.menu .poping.up').popup({
        onShow: function () {
            if ($('.top.menu .menu.transition').hasClass('visible')) {
                return false;
            }
        }
    });

    // Dropzone
    if ($('#dropzone').length > 0) {
        // Disable auto discover for all elements:
        Dropzone.autoDiscover = false;

        var filenameDict = {};
        var $dropz = $('#dropzone');
        $dropz.dropzone({
            url: $dropz.data('upload-url'),
            headers: {"X-Csrf-Token": csrf},
            maxFiles: $dropz.data('max-file'),
            maxFilesize: $dropz.data('max-size'),
            acceptedFiles: $dropz.data('accepts'),
            addRemoveLinks: true,
            dictDefaultMessage: $dropz.data('default-message'),
            dictInvalidFileType: $dropz.data('invalid-input-type'),
            dictFileTooBig: $dropz.data('file-too-big'),
            dictRemoveFile: $dropz.data('remove-file'),
            init: function () {
                this.on("success", function (file, data) {
                    filenameDict[file.name] = data.uuid;
                    $('.attachments').append('<input id="' + data.uuid + '" name="attachments" type="hidden" value="' + data.uuid + '">');
                })
                this.on("removedfile", function (file) {
                    if (file.name in filenameDict) {
                        $('#' + filenameDict[file.name]).remove();
                    }
                })
            }
        });
    }

    // Helpers.
    $('.delete-button').click(function () {
        var $this = $(this);
        $('.delete.modal').modal({
            closable: false,
            onApprove: function () {
                $.post($this.data('url'), {
                    "_csrf": csrf,
                    "id": $this.data("id")
                }).done(function (data) {
                    window.location.href = data.redirect;
                });
            }
        }).modal('show');
        return false;
    });

    initCommentForm();
    initInstall();
    initRepository();
});