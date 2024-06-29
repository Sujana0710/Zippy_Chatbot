<?php
require_once('database.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uniqueID = $_POST['uniqueID'];

    $sql = "SELECT empid, name, dpt, location, agreement FROM chatbot WHERE empid = '$uniqueID'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        // Fetch the content of the agreement (assuming it's stored as BLOB)
        $pdfContent = $row['agreement'];

        // Encode the PDF content as base64
        $row['agreement'] = base64_encode($pdfContent);

        echo json_encode($row);
    } else {
        echo json_encode(array('error' => 'User not found'));
    }
} else {
    echo json_encode(array('error' => 'Invalid request method'));
}

$conn->close();
?>
