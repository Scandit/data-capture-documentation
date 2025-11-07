---
description: "Powered by , a feature available in the Scandit Smart Data Capture SDK, this mode enables you to speed up finding and picking workflows by scanning multiple items at once and highlighting the correct item(s) in real-time using an AR overlay.                                                           "

framework: express
tags: [express]
keywords:
  - express
---

# Find Items

Powered by [MatrixScan Find](https://www.scandit.com/products/matrixscan-find/), a feature available in the Scandit Smart Data Capture SDK, this mode enables you to speed up finding and picking workflows by scanning multiple items at once and highlighting the correct item(s) in real-time using an AR overlay.

## Create the Find List

Using the Find mode in Scandit Express requires providing a list of barcodes to be found to the end-user. There are multiple ways to create this list, detailed below.

### Online Find List Generator

We recommend that you start with creating a list with the barcodes to find (Find List) using our [Find List generator](https://express.scandit.com/find/list/generator/). Here is how it works:

![Find List Generator](/static/img/express/find-list-generator.png)

### Spreadsheet Find List

You can also provide the Find List to your end-users as a spreadsheet.

### On Device

A Find List can also be created on the device by scanning the barcodes to be found, for example by using a reference sheet.

Select **Create List & Find** in the Scandit Express app and scan the barcodes to be found. The app will then create a Find List based on the scanned barcodes.

## Share the Find List

Once the Find List is created, it can be shared with the end-users by either sharing a link (via text, Slack, email, etc.) or by integrating into your app.

### Share a Link

You can also generate a URL in the format shown below and send it to the end-user. When the link is opened on the device, Scandit Express starts, the list of barcodes is shown and the user can start finding the barcodes with one click.

The link to your Find List must be in the following format:

```http
https://express.scandit.com/find/list?listName=<Your_List_Name_Here>&data=<List_of_Barcodes_Here>
``` 

Note the two query parameters that must be set in the URL:

| Parameter | Description |
| --- | --- |
| `listName` | The name of the Find List. |
| `data` | The list of barcodes to find, separated by commas. |


Remember to use URL encoding for the list name and the list of barcodes:

- For Excel, [ENCODEURL](https://support.microsoft.com/en-au/office/encodeurl-function-07c7fb90-7c60-4bff-8687-fac50fe33d0e) can be used.
- For Google Sheets, [ENCODEURL](https://support.google.com/docs/answer/9199778?hl=en) can be used.
- For JavaScript, [encodeURI()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI) can be used.
- For Python, [urllib.parse.urlencode](https://docs.python.org/3/library/urllib.parse.html#urllib.parse.urlencode) can be used.

### Integrate into Your App

You can also integrate the links for your Find List(s) (with the barcodes to find embedded in them) in your own application. Follow the instructions above to create your list, and then display the link in your app or your website. If a user clicks on the link it will start Scandit Express and show the list of codes that need to be found.

 To integrate specific barcodes to find, you need to:

1. Generate a JSON string.

    We encode your barcode values into a JSON object as shown below. The JSON object is directly encoded as a string into a QR-code to create the “Find Code”.

    ```json
    {

    "type":"findList", 

    "listName": "Pick list 230523", 

    "part": 1, 

    "partsTotal": 1, 

    "data": ["050755164998737161267150050464","267904872997493075660232174005","003599442103692589922600168806","794304938682592584917910934794","067998913805565298544505960433","429412684815666169331665683721","629486918747410911816814820923","918501883962214718784809774935","771678071143373996836361503435","535726211992040548851819865224"] 

    }
    ```

    The space in QR codes is limited, so if you have more codes that can fit into a single QR code you can create multiple codes. A good rule of thumb is to limit to 2000 barcode characters for a single QR code. Simply adjust the “partsTotal” field (`"partsTotal": 2`) and number each code using the `"part"` field accordingly (`"part": 1` and `"part": 2`).

2. Generate a QR code from the JSON string and display it to the user.

    Take the JSON created and generate a QR code from it. As an example you can check the implementation in our [spreadsheet template](https://docs.google.com/spreadsheets/d/1Aj0lDEaS6Kh3-8rWlxPOdnuoYcpzXH5OH4SsmvGIyaE/edit#gid=1367552303) (look at the hidden fields in column D-K). You can then display the QR in your app or website.
    
    From Scandit Express, the user can scan the QR with **Load List & Find** and start finding the barcodes.