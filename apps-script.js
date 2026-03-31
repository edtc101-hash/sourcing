// ===== INFAM 소싱관리 - Google Apps Script API =====
// 사용법:
// 1. Google Sheet > 확장 프로그램 > Apps Script 열기
// 2. 이 코드를 전체 복사하여 Code.gs에 붙여넣기
// 3. 배포 > 새 배포 > 웹 앱 > 액세스 권한: 모든 사용자 > 배포
// 4. 생성된 URL을 infam-product-page.html의 APPS_SCRIPT_URL에 입력

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};

  if (action === 'list') {
    var pm = ss.getSheetByName('제품마스터');
    var sc = ss.getSheetByName('소싱현황');

    var pmData = pm.getDataRange().getValues();
    var scData = sc.getDataRange().getValues();

    var pmHeaders = pmData[0];
    var scHeaders = scData[0];

    var products = [];
    for (var i = 1; i < pmData.length; i++) {
      var obj = {};
      for (var j = 0; j < pmHeaders.length; j++) {
        obj[pmHeaders[j]] = pmData[i][j];
      }
      products.push(obj);
    }

    var sourcing = [];
    for (var i = 1; i < scData.length; i++) {
      var obj = {};
      for (var j = 0; j < scHeaders.length; j++) {
        obj[scHeaders[j]] = scData[i][j];
      }
      sourcing.push(obj);
    }

    result = { success: true, products: products, sourcing: sourcing };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var params = JSON.parse(e.postData.contents);
  var action = params.action;
  var result = { success: false };

  if (action === 'update') {
    var sheet = ss.getSheetByName(params.sheet);
    var row = parseInt(params.row) + 1;
    var col = parseInt(params.col) + 1;
    sheet.getRange(row, col).setValue(params.value);
    result = { success: true, action: 'update' };
  }

  if (action === 'updateRow') {
    var sheet = ss.getSheetByName(params.sheet);
    var row = parseInt(params.row) + 1;
    var values = params.values;
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
    result = { success: true, action: 'updateRow' };
  }

  if (action === 'add') {
    var pmSheet = ss.getSheetByName('제품마스터');
    var scSheet = ss.getSheetByName('소싱현황');
    var lastRow = pmSheet.getLastRow();
    var newNo = lastRow;

    var pmValues = params.product;
    pmValues[0] = newNo;
    pmSheet.getRange(lastRow + 1, 1, 1, pmValues.length).setValues([pmValues]);

    var scValues = params.sourcing;
    scValues[0] = newNo;
    scSheet.getRange(lastRow + 1, 1, 1, scValues.length).setValues([scValues]);

    result = { success: true, action: 'add', newNo: newNo };
  }

  if (action === 'delete') {
    var rowNum = parseInt(params.row) + 1;
    var pmSheet = ss.getSheetByName('제품마스터');
    var scSheet = ss.getSheetByName('소싱현황');
    pmSheet.deleteRow(rowNum);
    scSheet.deleteRow(rowNum);
    result = { success: true, action: 'delete' };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
