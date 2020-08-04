import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import validUrl from 'valid-url';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());


  app.get("/filteredimage", async (req:express.Request, res:express.Response) => {
    try {
      const { image_url } = req.query;

      // Not null check for query parameter
      if (!image_url) {
        return res.status(422)
          .send({error: 'Please specify image_url as query parameter'});
      }

      // validate the image_url query
      if(!validUrl.isUri(image_url)){
        return res.status(415).send({error: 'Please enter a valid url'});
      }

      // call filterImageFromURL(image_url) to filter the image
      let imgPath = await filterImageFromURL(image_url);
      if(imgPath) {
        res.on('finish', () => deleteLocalFiles([imgPath]));
        return res.status(200).sendFile(imgPath.trim());
      } 
    } catch {
      return res.status(500).send({error: 'Unable to process your request'})
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();