<?php
/*
FILE : startPage.php
PROJECT : Simple Text Editor
PROGRAMMER : Chris Wickens
FIRST VERSION : 11/25/2024
DESCRIPTION :
        Contains the PHP logic necessary to enable the simple text editor website to
        load a file list, load file contents, and save the data to the file or as a new file    
*/

// Check if the request is a POST request
// This will force the main HTML page to load, since this file is only for logic
if (
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {
    // Redirect to the HTML page if it's not a POST request
    header('Location: index.html');
    exit();
}

// Default directory location for files
$directory = '.\\MyFiles\\';

// Handle the AJAX request to get files
if (
    // Ensure proper post data was sent
    isset($_POST['phpFunction'])
    && $_POST['phpFunction'] == 'getFileList'
) {
    if (is_dir($directory)) { // Check if it's a directory and if it exists
        $files = scandir($directory); // Scandir to get all the files

        $filteredFiles = [];
        foreach ($files as $file) {
            // Make the complete file path, to check if it's a file
            // and NOT a directory
            $filePath = $directory . '/' . $file;
            // Ensure it skips the . and .. from the directory list
            // As well as ensuring it is only reading files
            if ($file !== '.' && $file !== '..' && is_file($filePath)) {
                $filteredFiles[] = $file; // Only add files
            }
        }

        // Check if there are no files found
        if (empty($filteredFiles)) {
            echo json_encode(["error" => 'No files found in the directory (' . $directory . ')']);
        } else {
            echo json_encode($filteredFiles); // Return the list of files
        }
    } else {
        // Return an error encoded in json (data.error)
        echo json_encode(["error" => 'Directory (' . $directory . ') not found']);
    }
    exit();
}



// Handle the AJAX request to get file content
if (
    // Ensure proper post data was sent
    isset($_POST['phpFunction'])
    && $_POST['phpFunction'] == 'getFileContent'
    && isset($_POST['fileName'])
) {
    // Create the full path file name, . to concatenate, because PHP reason
    // I found stuff about basename being use to stop malicious folder access and other security issues.
    // Figured I would try it out!
    $fileName = $directory . basename($_POST['fileName']);
    if (file_exists($fileName)) {
        $content = file_get_contents($fileName);
        echo json_encode(['content' => $content]);
    } else {
        echo json_encode(['error' => 'File (' . $fileName . ') not found']);
    }
    exit();
}

// Handle the AJAX request to save file content
// This is used for SAVE and SAVE AS, since the ajax call will pass in
// the necessary file name (the existing one, or the user entry for a save as file)
if (
    // Ensure proper post data was sent
    isset($_POST['phpFunction'])
    && $_POST['phpFunction'] == 'saveFile'
    && isset($_POST['fileName'])
    && isset($_POST['content'])
) {
    $fileName = $directory . basename($_POST['fileName']);
    $content = $_POST['content'];
    // Was the file saved successfully?
    if (file_put_contents($fileName, $content) !== false) {
        echo json_encode(['success' => 'File saved successfully']);
    } else {
        echo json_encode(['error' => 'Failed to save file']);
    }
    exit();
}
