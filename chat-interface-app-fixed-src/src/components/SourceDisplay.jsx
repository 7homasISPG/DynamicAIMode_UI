import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Globe } from 'lucide-react';

const SourceDisplay = ({ sources = [] }) => {
    if (!sources || sources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <FileText className="h-12 w-12 mb-3 text-gray-300" />
                <p className="text-sm text-center">Sources will appear here when available</p>
            </div>
        );
    }

    const getHostname = (url) => {
        try {
            return new URL(url).hostname;
        } catch (error) {
            return url;
        }
    };

    return (
        <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sources</h3>
                <p className="text-sm text-gray-600">
                    {sources.length} source{sources.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Scrollable source list */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {sources.map((source, index) => {
                    const sourceUrl = source.source || source.url;
                    const domain = getHostname(sourceUrl);
                    const fallbackImage = `https://image.thum.io/get/width/600/crop/600/noanimate/${sourceUrl}`;

                    return (
                        <Card
                            key={index}
                            className="border border-gray-200 hover:border-blue-300 transition-colors flex flex-col h-[calc(100%-1rem)]"
                        >
                            <CardHeader className="pb-2 flex-shrink-0">
                                <div className="flex items-start justify-between">
                                    <Badge variant="secondary" className="text-xs max-w-[120px] truncate">
                                        {domain}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(sourceUrl, '_blank')}
                                        className="h-6 w-6 p-0"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0 flex flex-col flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Globe className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 truncate">{domain}</span>
                                </div>

                                {source.title && (
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                        {source.title}
                                    </h4>
                                )}

                                {source.snippet && (
                                    <p className="text-xs text-gray-600 line-clamp-3 mb-2">{source.snippet}</p>
                                )}

                                {/* Flexible iframe container */}
                                <div className="relative border rounded overflow-hidden flex-1">
                                    <iframe
                                        src={sourceUrl}
                                        className="absolute top-0 left-0 w-full h-full"
                                        title={`iframe-${index}`}
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const img = document.getElementById(`fallback-img-${index}`);
                                            if (img) img.style.display = 'block';
                                        }}
                                    />
                                    <img
                                        id={`fallback-img-${index}`}
                                        src={fallbackImage}
                                        alt="Preview fallback"
                                        className="w-full h-full object-cover"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default SourceDisplay;
