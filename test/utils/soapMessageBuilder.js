import Handlebars from 'handlebars'
import {
  clearanceRequestTemplate,
  finalisationNotificationTemplate,
  errorNotificationTemplate
} from './soapTemplates.js'

function generateRandomMRN() {
  return (
    '21GB' +
    Math.floor(Math.random() * 1e12)
      .toString()
      .padStart(14, '0')
  )
}

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
        EntryVersionNumber: 1,
        PreviousVersionNumber: null,
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

    this._model = {}
    this._generatedMRN = null

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (Reflect.has(target, prop))
          return Reflect.get(target, prop, receiver)
        if (target._model && prop in target._model) {
          return target._model[prop]
        }
        return undefined
      }
    })
  }

  buildModel(overrides = {}) {
    const defaults = this.defaultMessageData[this.templateType]

    const baseData = {
      ...Object.fromEntries(
        Object.entries(defaults).filter(([key]) => overrides[key] === undefined)
      ),
      ...overrides
    }

    if (!baseData.mrn) {
      if (!this._generatedMRN) {
        this._generatedMRN = generateRandomMRN()
      }
      baseData.mrn = this._generatedMRN
    }

    if (this.templateType === 'clearance') {
      baseData.items = this.items

      if (baseData.PreviousVersionNumber == null) {
        const entryVersion = baseData.EntryVersionNumber
        if (entryVersion > 1) {
          baseData.PreviousVersionNumber = entryVersion - 1
        }
      }
    }

    this._model = baseData
    return this
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

    const docs = (overrides.Documents ?? defaultItem.Documents).map((doc) => ({
      ...Object.fromEntries(
        Object.entries(defaultDocument).filter(
          ([key]) => doc[key] === undefined
        )
      ),
      ...doc
    }))

    const checks = (overrides.Checks ?? defaultItem.Checks).map((check) => ({
      ...Object.fromEntries(
        Object.entries(defaultCheck).filter(([key]) => check[key] === undefined)
      ),
      ...check
    }))

    const item = {
      ...Object.fromEntries(
        Object.entries(defaultItem).filter(
          ([key]) => overrides[key] === undefined
        )
      ),
      ...overrides,
      Documents: docs,
      Checks: checks
    }

    this.items.push(item)
    return this
  }

  buildMessage(overrides = {}) {
    const templates = {
      clearance: clearanceRequestTemplate,
      finalisation: finalisationNotificationTemplate,
      error: errorNotificationTemplate
    }

    const template = Handlebars.compile(templates[this.templateType])
    const fullData = this.buildModel(overrides)._model
    return template(fullData)
  }
}
