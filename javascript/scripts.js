/*
    FILE : scripts.js
    PROJECT : Simple Text Editor
    PROGRAMMER : Chris Wickens
    FIRST VERSION : 11/25/2024
    DESCRIPTION :
        This file contains the jquery and ajax calls necessary to use the startPage.php file.
        This code is intended to act as a very simple text editor, and use ajax to update the page dynamically.
*/

$(document).ready(function () { // When the document is ready
    let currentFile = ''; // Variable to store the current file name

    /*
    FUNCTION : displayError()
    DESCRIPTION : This function is used to display ERROR messages
    PARAMETERS : errorMessage - the message to display
    RETURNS : None
    */
    function displayError(errorMessage) {
        $('#errorSection').text(errorMessage);
    }

    /*
    FUNCTION : displayMessage()
    DESCRIPTION : This function is used to display STATUS messages
    PARAMETERS : statusMessage - the message to display
    RETURNS : None
    */
    function displayMessage(statusMessage) {
        $('#messageSection').text(statusMessage);
    }

    // Reset the message displays any time a control is clicked (just to make it easier)
    $('.controlElement').click(function () {
        displayError('');
        displayMessage('');
    });

    // Load the file list when the Load Files button is clicked
    $('#loadFileListButton').click(function () {
        // Disable controls and reset UI elements before loading files
        $('#saveButton, #saveAsButton, #newFileName').prop('disabled', true);
        $('#editor').val('');
        // This line ensured that if files are deleted and the list is reloaded
        // it will display the default value properly again
        $('#selectFile').empty().append('<option value="" disabled selected>Click LOAD FILES</option>');
        $('#selectFile').prop('disabled', true); // Disable file selector initially

        // The AJAX call for loading the file list
        $.ajax({
            url: 'backend.php',
            type: 'POST',
            data: { phpFunction: 'getFileList' },
            success: function (response) {
                const files = JSON.parse(response);

                if (files.error) {
                    // Show the error
                    displayError(files.error);
                } else {
                    $('#selectFile').empty(); // Empty the selector
                    $('#selectFile').append('<option value="" disabled selected>File List</option>');

                    // Populate the select box with files
                    files.forEach(file => {
                        $('#selectFile').append(`<option value="${file}">${file}</option>`);
                    });

                    // Enable the file selector
                    $('#selectFile').removeAttr('disabled');
                    displayMessage(`Files loaded! ${files.length} files found!`);
                }
            },
            error: function () {
                // Reset select box and show an error
                $('#selectFile').empty().append('<option value="" disabled selected>Click LOAD FILES</option>');
                displayError('ERROR: Unable to load file list.');
            }
        });
    });

    // Load file content when an file name
    // is selected from the select for files
    // loads contents into editor
    // Follows the same type of logic as the above jquery/akax code
    $('#selectFile').change(function () {
        const fileName = $(this).val();
        if (!fileName) {
            // Display an error if no file is selected (default option still selected!)
            displayError('ERROR: No file selected. Please choose a file from the list.');
        } else {
            currentFile = fileName;
            $.ajax({
                url: 'backend.php',
                type: 'POST',
                data: { phpFunction: 'getFileContent', fileName: fileName },
                success: function (response) {
                    const data = JSON.parse(response);
                    // If the PHP returned error in the data
                    if (data.error) {
                        displayError(data.error);
                    }
                    // Otherwise, assume success
                    else {
                        // Handles a file being empty
                        // If the file is empty, display an empty text box, instead of 
                        if (data.content) {
                            $('#editor').val(data.content);
                        } else {
                            $('#editor').val('');
                        }
                        // Enable control elements once the data is loaded
                        $('#saveButton, #saveAsButton, #newFileName').removeAttr('disabled');
                        displayMessage(`Loaded file: ${fileName} ...`);
                    }
                },
                // Ajax request failure
                error: function () {
                    displayError('ERROR: Unable to load file content.');
                }
            });
        }
    });

    // Save the text editor content to the file when Save is clicked
    $('#saveButton').click(function () {
        if (currentFile) {
            editorContent = $('#editor').val();
            $.ajax({
                url: 'backend.php',
                type: 'POST',
                data: { phpFunction: 'saveFile', fileName: currentFile, content: editorContent },
                success: function (response) {
                    data = JSON.parse(response);
                    // If the php page returned error in data
                    if (data.error) {
                        displayError(`ERROR: ${data.error}`);
                    }
                    // Success
                    else {
                        displayMessage('File saved!');
                    }
                },
                // Ajax request failure
                error: function () {
                    displayError(data.error);
                }
            });
        }
        else {
            displayError('ERROR: Please pick a file to save!');
        }
    });

    // Save the file as a new file when Save As is clicked
    // Will present an error if no file name is provided
    $('#saveAsButton').click(function () {
        const newFileName = $('#newFileName').val();
        if (newFileName) {
            editorContent = $('#editor').val();
            $.ajax({
                url: 'backend.php',
                type: 'POST',
                data: { phpFunction: 'saveFile', fileName: newFileName, content: editorContent },
                success: function (response) {
                    data = JSON.parse(response);
                    if (data.error) {
                        displayError(`ERROR: ${data.error}`);
                    }
                    else {
                        displayMessage('File saved as ' + newFileName + '!');
                        currentFile = newFileName;
                        // Reset the new file name text element
                        $('#newFileName').val('');
                        // Add the new file to the list
                        $('#selectFile').append(`<option value="${newFileName}">${newFileName}</option>`);
                    }
                },
                error: function () {
                    displayError(data.error);
                }
            });
        }
        else {
            displayError('ERROR: Please enter a VALID new file name!');
        }
    });
});