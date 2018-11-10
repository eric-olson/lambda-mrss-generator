//
// generate.js
// (c) Eric Olson, 2018
//
// Generates an MRSS XML for brightsign players.
//

// creates a single entry for one file
function generateSingleEntry(baseUrl, dateString, fileName, size, eTag) {
  var ext = fileName.split('.').pop().toLowerCase();
  var fileType = "";
  if (ext == "jpg" || ext == "jpeg") {
    fileType = "image/jpeg";
  }
  else if (ext == "png") {
    fileType = "image/png";
  }
  var entry = `  <item>
    <title>${fileName}</title>
    <pubDate>${dateString}</pubDate>
    <link>${baseUrl}/${fileName}</link>
    <description>${fileName}</description>
    <guid isPermaLink="false">${eTag.slice(1, -1)}</guid>
    <media:content url="${baseUrl}/${fileName}" fileSize="${size}" type="${fileType}" medium="image" duration="10"/>
  </item>
`;

  return entry;
}

// creates a full XML file
function generateFullXML(baseUrl, fileInfo) {
  var header = `<?xml version="1.0" encoding="utf-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>RRC Brightsign Feed</title>
  <link>${baseUrl}/brightsign.xml</link>
  <generator>Image MRSS Generator Script</generator>
  <ttl>10</ttl>
`;

  var footer = `</channel>
</rss>
`;

  var output = header;

  for (const file of fileInfo) {
    var date = new Date(file.LastModified).toUTCString();
    output += generateSingleEntry(baseUrl, date, file.Key, file.Size, file.ETag);
  }

  output += footer;

  // console.log(output);

  return output;
}

exports.generateFullXML = generateFullXML;

