//
// index.js
// (c) Eric Olson, 2018
//
// Updates an MRSS file on new uploads to S3
//
console.log('Loading function');

// AWS includes
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

// npm includes
const async = require('async');
const util = require('util');

// local includes
const generator = require('generate.js');


exports.handler = function (event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    var dstBucket = process.env.FEED_BUCKET;
    var dstKey    = srcBucket + "-feed.xml";
    var srcUrl    = process.env.BASE_URL + "/" + srcBucket;

    // Sanity check: validate that source and destination are different buckets.
    if (srcBucket == dstBucket) {
        callback("Source and destination buckets are the same.");
        return;
    }

    async.waterfall([
        // gets list of contents in src bucket
        function getList(next) {
            // construct parameters
            var params = {
              Bucket: srcBucket, 
              MaxKeys: 20
            };
            s3.listObjectsV2(params, next);
        },

        function generate(result, next) {
            // console.log(result);
            var xmlString = generator.generateFullXML(srcUrl, result.Contents);
            var xmlBuffer = Buffer.from(xmlString);
            console.log("uploading to S3...");
            var params = {
                Bucket: 'rrc-brightsign-test-feeds',
                Key: srcBucket + '-feed.xml',
                Body: xmlBuffer
            }
            s3.upload(params, next);
        }
        ], function(err) {
            if (err) {
                console.log("ERROR");
                callback(err);
            }
            else {
                console.log("Done!");
                callback(null, "message");
            }
        }
    );
};

