import Handlebars from 'handlebars'
import {
  clearanceRequestTemplate,
  finalisationNotificationTemplate,
  errorNotificationTemplate
} from './soapTemplates.js'

export class SoapMessageBuilder {
  constructor(templateType = 'clearance') {
    this.templateType = templateType
    this.items = []
    this.itemCounter = 1

    const baseDefaults = {
      username: 'systemID=ALVSHMRCCDS,ou=gsi systems,o=cds',
      passwordType:
        'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText',
      password: 'password',
      timeStamp: new Date().toISOString(),
      SourceSystem: 'CDS',
      DestinationSystem: 'ALVS',
      CorrelationId: Math.floor(Math.random() * 1e12)
    }

    this.defaultMessageData = {
      clearance: {
        ...baseDefaults,
        mrn: '21GB12345678901234',
        EntryVersionNumber: 2,
        PreviousVersionNumber: 1,
        DeclarationUCR: '1GB126344356000-ABC35932Y1BHX',
        DeclarationType: 'S',
        ArrivalDateTime: '202201031224',
        SubmitterTURN: '123456789012',
        DeclarantId: 'GB123456789013',
        DeclarantName: 'DeclarantName',
        DispatchCountryCode: 'CN',
        GoodsLocationCode: 'GBBLY',
        MasterUCR: 'GB/CNXX-XCT1123LF00000'
      },
      finalisation: {
        ...baseDefaults,
        EntryReference: '25GBBB9S5WKC875S3E',
        EntryVersionNumber: 1,
        DecisionNumber: 1,
        FinalState: 1,
        ManualAction: 'N'
      },
      error: {
        ...baseDefaults,
        SourceCorrelationId: '39119311',
        EntryReference: '25GBAH9S5BKC885S3E',
        EntryVersionNumber: 1,
        ErrorCode: 'HMRCVAL101',
        ErrorMessage:
          'The EntryReference was not recognised. HMRC is unable to process the decision notification'
      }
    }
  }

  addItem(overrides = {}) {
    if (this.templateType !== 'clearance') {
      throw new Error(`addItem is only supported for clearance requests`)
    }

    const defaultDocument = {
      DocumentCode: 'N853',
      DocumentReference: 'GBCVD2025.2123456',
      DocumentStatus: 'AE',
      DocumentControl: 'P'
    }

    const defaultCheck = {
      CheckCode: 'H221',
      DepartmentCode: 'AHVLA'
    }

    const defaultItem = {
      ItemNumber: this.itemCounter++,
      CustomsProcedureCode: '4000000',
      TaricCommodityCode: '1309105100',
      GoodsDescription: 'GoodsDescription',
      ConsigneeId: 'GB12345678',
      ConsigneeName: 'ConsigneeName',
      ItemNetMass: '5011.200',
      ItemOriginCountryCode: 'CN',
      Documents: [defaultDocument],
      Checks: [defaultCheck]
    }

    const docs = (overrides.Documents || defaultItem.Documents).map((doc) => ({
      ...defaultDocument,
      ...doc
    }))

    const checks = (overrides.Checks || defaultItem.Checks).map((check) => ({
      ...defaultCheck,
      ...check
    }))

    const item = {
      ...defaultItem,
      ...overrides,
      Documents: docs,
      Checks: checks
    }

    this.items.push(item)
    return this
  }

  build(overrides = {}) {
    const templates = {
      clearance: clearanceRequestTemplate,
      finalisation: finalisationNotificationTemplate,
      error: errorNotificationTemplate
    }

    const template = Handlebars.compile(templates[this.templateType])

    const fullData = {
      ...this.defaultMessageData[this.templateType],
      ...overrides
    }

    if (this.templateType === 'clearance') {
      fullData.items = this.items
    }

    return template(fullData)
  }
}
