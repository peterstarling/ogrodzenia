<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="<% csrf_token() %>">

    <title>Panel administracyjny</title>

    
    <!-- Styles -->
    <%-- <link href="/css/admin.css" rel="stylesheet"> --%>

    <!-- Scripts -->
    <script>
        window.token = <?php echo json_encode([
            'csrfToken' => csrf_token(),
        ]); ?>
    </script>

    <base href="/admin/">

</head>
<body ng-app="app">
    <a ui-sref="home" ui-sref-active="active">Hello</a>
    <a ui-sref="about" ui-sref-active="active">About</a>

    <ui-view></ui-view>


    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js"></script>
    <script src="<% elixir('js/app.js') %>"></script>
</body>
</html>