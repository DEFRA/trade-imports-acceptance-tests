export const soapTemplate = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <soap:Header>
        <oas:Security soap:role="system" soap:mustUnderstand="true">
            <oas:UsernameToken>
                <oas:Username>{{username}}</oas:Username>
                <oas:Password Type="{{passwordType}}">{{password}}</oas:Password>
            </oas:UsernameToken>
        </oas:Security>
    </soap:Header>
    <soap:Body>
        <ALVSClearanceRequest xmlns="http://submitimportdocumenthmrcfacade.types.esb.ws.cara.defra.com">
            <ServiceHeader>
                <SourceSystem>{{SourceSystem}}</SourceSystem>
                <DestinationSystem>{{DestinationSystem}}</DestinationSystem>
                <CorrelationId>{{CorrelationId}}</CorrelationId>
                <ServiceCallTimestamp>{{timeStamp}}</ServiceCallTimestamp>
            </ServiceHeader>
            <Header>
                <EntryReference>{{mrn}}</EntryReference>
                <EntryVersionNumber>{{EntryVersionNumber}}</EntryVersionNumber>
                <PreviousVersionNumber>{{PreviousVersionNumber}}</PreviousVersionNumber>
                <DeclarationUCR>{{DeclarationUCR}}</DeclarationUCR>
                <DeclarationType>{{DeclarationType}}</DeclarationType>
                <ArrivalDateTime>{{ArrivalDateTime}}</ArrivalDateTime>
                <SubmitterTURN>{{SubmitterTURN}}</SubmitterTURN>
                <DeclarantId>{{DeclarantId}}</DeclarantId>
                <DeclarantName>{{DeclarantName}}</DeclarantName>
                <DispatchCountryCode>{{DispatchCountryCode}}</DispatchCountryCode>
                <GoodsLocationCode>{{GoodsLocationCode}}</GoodsLocationCode>
                <MasterUCR>{{MasterUCR}}</MasterUCR>
            </Header>
            {{#each items}}
            <Item>
                <ItemNumber>{{ItemNumber}}</ItemNumber>
                <CustomsProcedureCode>{{CustomsProcedureCode}}</CustomsProcedureCode>
                <TaricCommodityCode>{{TaricCommodityCode}}</TaricCommodityCode>
                <GoodsDescription>{{GoodsDescription}}</GoodsDescription>
                <ConsigneeId>{{ConsigneeId}}</ConsigneeId>
                <ConsigneeName>{{ConsigneeName}}</ConsigneeName>
                <ItemNetMass>{{ItemNetMass}}</ItemNetMass>
                <ItemOriginCountryCode>{{ItemOriginCountryCode}}</ItemOriginCountryCode>
                <Document>
                    <DocumentCode>{{Document.DocumentCode}}</DocumentCode>
                    <DocumentReference>{{Document.DocumentReference}}</DocumentReference>
                    <DocumentStatus>{{Document.DocumentStatus}}</DocumentStatus>
                    <DocumentControl>{{Document.DocumentControl}}</DocumentControl>
                </Document>
                <Check>
                    <CheckCode>{{Check.CheckCode}}</CheckCode>
                    <DepartmentCode>{{Check.DepartmentCode}}</DepartmentCode>
                </Check>
            </Item>
            {{/each}}
        </ALVSClearanceRequest>
    </soap:Body>
</soap:Envelope>`
