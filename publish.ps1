$source = "dist\"
$packageJSon = $source + "package.json"
$destination = "C:\Users\mrdnd\src\self-hosted-ai-starter-kit\n8n\data\nodes\node_modules\n8n-nodes-mezon"

echo "Building the project..."
npm run build

echo "Copying files from $source to $destination"
Copy-Item -Path $source -Destination $destination -Recurse -Force

echo "Copying package.json from $packageJSon to $destination"
Copy-Item -Path $packageJSon -Destination $destination -Recurse -Force

echo "Done!"
