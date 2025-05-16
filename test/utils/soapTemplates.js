export const clearanceRequestTemplate = `<?xml version="1.0" encoding="utf-8"?>
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
        <ALVSClearanceRequest
            xmlns="http://submitimportdocumenthmrcfacade.types.esb.ws.cara.defra.com">
            <ServiceHeader>
                <SourceSystem>{{SourceSystem}}</SourceSystem>
                <DestinationSystem>{{DestinationSystem}}</DestinationSystem>
                <CorrelationId>{{CorrelationId}}</CorrelationId>
                <ServiceCallTimestamp>{{timeStamp}}</ServiceCallTimestamp>
            </ServiceHeader>
            <Header>
                <EntryReference>{{mrn}}</EntryReference>
                <EntryVersionNumber>{{EntryVersionNumber}}</EntryVersionNumber>
                {{#if PreviousVersionNumber}}  
                <PreviousVersionNumber>{{PreviousVersionNumber}}</PreviousVersionNumber>
                {{/if}}
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
    {{#each Documents}}
      <Document>
        <DocumentCode>{{DocumentCode}}</DocumentCode>
        <DocumentReference>{{DocumentReference}}</DocumentReference>
        <DocumentStatus>{{DocumentStatus}}</DocumentStatus>
        <DocumentControl>{{DocumentControl}}</DocumentControl>
      </Document>
    {{/each}}
    {{#each Checks}}
      <Check>
        <CheckCode>{{CheckCode}}</CheckCode>
        <DepartmentCode>{{DepartmentCode}}</DepartmentCode>
      </Check>
    {{/each}}
  </Item>
{{/each}}
    </ALVSClearanceRequest>
    </soap:Body>
</soap:Envelope>`

export const finalisationNotificationTemplate = `<?xml version="1.0" encoding="utf-8"?>
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
        <FinalisationNotificationRequest
            xmlns="http://notifyfinalisedstatehmrcfacade.types.esb.ws.cara.defra.com">
            <ServiceHeader>
                <SourceSystem>{{SourceSystem}}</SourceSystem>
                <DestinationSystem>{{DestinationSystem}}</DestinationSystem>
                <CorrelationId>{{CorrelationId}}</CorrelationId>
                <ServiceCallTimestamp>{{timeStamp}}</ServiceCallTimestamp>
            </ServiceHeader>
            <Header>
                <EntryReference>{{EntryReference}}</EntryReference>
                <EntryVersionNumber>{{EntryVersionNumber}}</EntryVersionNumber>
                <DecisionNumber>{{DecisionNumber}}</DecisionNumber>
                <FinalState>{{FinalState}}</FinalState>
                <ManualAction>{{ManualAction}}</ManualAction>
            </Header>
        </FinalisationNotificationRequest>
    </soap:Body>
</soap:Envelope>`

export const errorNotificationTemplate = `<?xml version="1.0" encoding="utf-8"?>
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
        <ALVSErrorNotificationRequest
            xmlns="http://alvserrornotification.types.esb.ws.cara.defra.com">
            <ServiceHeader>
                <SourceSystem>{{SourceSystem}}</SourceSystem>
                <DestinationSystem>{{DestinationSystem}}</DestinationSystem>
                <CorrelationId>{{CorrelationId}}</CorrelationId>
                <ServiceCallTimestamp>{{timeStamp}}</ServiceCallTimestamp>
            </ServiceHeader>
            <Header>
                <SourceCorrelationId>{{SourceCorrelationId}}</SourceCorrelationId>
                <EntryReference>{{EntryReference}}</EntryReference>
                <EntryVersionNumber>{{EntryVersionNumber}}</EntryVersionNumber>
            </Header>
            <Error>
                <ErrorCode>{{ErrorCode}}</ErrorCode>
                <ErrorMessage>{{ErrorMessage}}</ErrorMessage>
            </Error>
        </ALVSErrorNotificationRequest>
    </soap:Body>
</soap:Envelope>`
