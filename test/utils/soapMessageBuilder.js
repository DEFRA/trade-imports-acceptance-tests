import Handlebars from 'handlebars';
import { soapTemplate } from './soapTemplate.js';

export class SoapMessageBuilder {
    constructor() {
        this.items = [];
        this.itemCounter = 1;

        this.defaultMessageData = {
            SourceSystem: "CDS",
            DestinationSystem: "ALVS",
            timeStamp: new Date().toISOString(),
            mrn: "21GB12345678901234",
            CorrelationId: 'CORR-' + Math.floor(Math.random() * 1e12),
            EntryVersionNumber: 3,
            PreviousVersionNumber: 2,
            DeclarationUCR: '1GB126344356000-ABC35932Y1BHX',
            DeclarationType: 'S',
            ArrivalDateTime: '202201031224',
            SubmitterTURN: '123456789012',
            DeclarantId: 'GB123456789013',
            DeclarantName: 'DeclarantName',
            DispatchCountryCode: 'CN',
            GoodsLocationCode: 'GBBLY',
            MasterUCR: 'GB/CNXX-XCT1123LF00000',
        };
    }
    
    // ToDo: Multiple docs? Multiple Checks?
    addItem(overrides = {}) {
        const defaultItem = {
            ItemNumber: this.itemCounter++,
            CustomsProcedureCode: '4000000',
            TaricCommodityCode: '1309105100',
            GoodsDescription: 'GoodsDescription',
            ConsigneeId: 'GB12345678',
            ConsigneeName: 'ConsigneeName',
            ItemNetMass: '5011.200',
            ItemOriginCountryCode: 'CN',
            Document: {
                DocumentCode: 'N853',
                DocumentReference: 'GBCVD2025.2123456',
                DocumentStatus: 'XX',
                DocumentControl: 'X'
            },
            Check: {
                CheckCode: 'H222',
                DepartmentCode: 'PHA'
            }
        };

        const item = {
            ...defaultItem,
            ...overrides,
            Document: { ...defaultItem.Document, ...overrides.Document },
            Check: { ...defaultItem.Check, ...overrides.Check }
        };

        this.items.push(item);
        return this;
    }

    build(data) {
        const template = Handlebars.compile(soapTemplate);
        return template({
            ...this.defaultMessageData,
            ...data,
            items: this.items
        });
    }
} 