export default function server(app, port) {
    app.listen(port, (err) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log(`Server is running on port ${port}`);
    });
}