/*
Copy these codes to Google Earth Engine in code.earthengine.google.com
Modern Integrated Surveying Technology Lab 1
Thepchai Srinoi
Department of Survey Engineering Chulalongkorn University
*/

var POI = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([100.53208442580956, 13.738378214974896])
    
var geometry = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[100.51792295418284, 13.75030851250469],
          [100.51792295418284, 13.728631088940055],
          [100.54521711311838, 13.728631088940055],
          [100.54521711311838, 13.75030851250469]]], null, false)
          
var water = /* color: #0b4a8b */ee.Geometry.MultiPoint(
        [[100.53028257332346, 13.738688412207255],
         [100.53807170830271, 13.739397098504595],
         [100.5093073772808, 13.735096007325781],
         [100.54401461786105, 13.728762297703087],
         [100.54017369455173, 13.731982770722682]])
         
var building = /* color: #ffc82d */ee.Geometry.MultiPoint(
        [[100.53318785553455, 13.73680590583052],
         [100.52841352348804, 13.734341100091573],
         [100.52595525630035, 13.738990670057122],
         [100.52843947491684, 13.743201476862252],
         [100.53148646435776, 13.746557231318036]])
         
var forest = /* color: #0e7709 */ee.Geometry.MultiPoint(
        [[100.54019175958479, 13.729740727620737],
         [100.53830341044181, 13.731275854106347],
         [100.5454299659421, 13.73837681130127],
         [100.56636199655672, 13.690479334058912],
         [100.56855549924721, 13.696133866123374]])
         
var grassland = /* color: #00f117 */ee.Geometry.MultiPoint(
        [[100.53735451498486, 13.736486789869073],
         [100.5310107127775, 13.738602437783317],
         [100.52317284706173, 13.739575919728463],
         [100.53741537693081, 13.741365862813128]]);


// Open Image
var peach = ee.ImageCollection('COPERNICUS/S2_SR')
              .filterBounds(POI)
              .filterDate('2023-1-1','2023-1-5')
              .mosaic()
              
var bands = ['B2','B3','B4','B8'] //select band combination

// Run NDVI
var ndvi = peach.normalizedDifference(['B8','B4'])

// Group the data : Multipoint from your production, assign class number for classification
var traindata = ee.FeatureCollection([ee.Feature(water,{'class':0}),
                        ee.Feature(building,{'class':1}),
                        ee.Feature(forest,{'class':2}),
                        ee.Feature(grassland,{'class':3})
                          ])
console.log(traindata) // Investigation this featurecollection

// Extract raster value to the points
var trainvalue = peach.sampleRegions({collection:traindata  , properties:['class'] , scale:10})

// Teach Mr.CART 
var mrcart = ee.Classifier.smileCart().train(trainvalue, 'class', bands)

// Solo
var classified = peach.select(bands).classify(mrcart)

// Visualization
Map.centerObject(POI, 14)

// Optical Image Visualization
// Convert from imagecollection to image before clip by your boundary
var viz_truecolor = {min:0, max:3000, bands:['B4','B3','B2']}
Map.addLayer(peach.clip(geometry), viz_truecolor, 'truecolor_chula')
var viz_truecolor = {min:0, max:3000, bands:['B5','B4','B3']}
Map.addLayer(peach.clip(geometry), viz_truecolor, 'falsecolor_chula')

// Greyscale Visualization
var viz_ndvi = {min:-0.5, max:0.5, palette:['red','yellow','cyan','purple'] }
Map.addLayer(ndvi, viz_ndvi, 'ndvi_chula')
var viz_classy = {min:0, max:3, palette:['blue','red','green','pink'] }
Map.addLayer(classified, viz_classy, 'classyresult_chula')
